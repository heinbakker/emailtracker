/*
  # Fix Organization Lookup

  1. Changes
    - Add public policy for invite code lookups
    - Simplify member access policy
    - Add proper error handling for no results

  2. Security
    - Maintain RLS while allowing public lookups
    - Ensure proper access control
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "organizations_public_lookup" ON organizations;
DROP POLICY IF EXISTS "organizations_member_access" ON organizations;

-- Create new policies with proper public access
CREATE POLICY "organizations_public_lookup"
  ON organizations
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
  );

CREATE POLICY "organizations_member_access"
  ON organizations
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
DROP FUNCTION IF EXISTS set_invite_code_context(input_code text);

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

-- Grant execute to public for registration flow
GRANT EXECUTE ON FUNCTION set_invite_code_context(text) TO public;