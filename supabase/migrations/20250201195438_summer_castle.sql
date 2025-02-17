/*
  # Fix Organization Lookup

  1. Changes
    - Simplify organization lookup policy
    - Add public access for registration
    - Fix invite code context handling

  2. Security
    - Maintain RLS protection
    - Allow public invite code lookups
    - Protect member-only data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "organizations_access_policy" ON organizations;

-- Create separate policies for different access patterns
CREATE POLICY "organizations_invite_lookup" ON organizations
  FOR SELECT
  TO public
  USING (
    -- Only allow access to minimal info when looking up by invite code
    upper(invite_code) = upper(current_setting('app.current_invite_code', true))
    AND is_active = true
  );

CREATE POLICY "organizations_member_access" ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Update invite code function to handle nulls better
CREATE OR REPLACE FUNCTION set_invite_code_context(input_code text)
RETURNS void AS $$
BEGIN
  -- Handle null/empty input properly
  IF input_code IS NULL OR trim(input_code) = '' THEN
    PERFORM set_config('app.current_invite_code', '', true);
  ELSE
    PERFORM set_config('app.current_invite_code', upper(trim(input_code)), true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION set_invite_code_context(text) TO public;