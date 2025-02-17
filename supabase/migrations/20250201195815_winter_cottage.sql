/*
  # Fix Organization Lookup and Auth

  1. Changes
    - Simplify organization policies
    - Add proper error handling for auth
    - Fix invite code lookup

  2. Security
    - Maintain RLS while allowing public lookups
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "organizations_public_lookup" ON organizations;
DROP POLICY IF EXISTS "organizations_member_access" ON organizations;

-- Create a single, simple policy for organization access
CREATE POLICY "organizations_access"
  ON organizations
  FOR SELECT
  USING (
    -- Allow if:
    is_active = true  -- Organization is active
    AND (
      -- Public invite code lookup
      CASE 
        WHEN current_setting('app.current_invite_code', true) IS NOT NULL 
        AND current_setting('app.current_invite_code', true) != ''
        THEN upper(invite_code) = upper(current_setting('app.current_invite_code', true))
        ELSE false
      END
      OR
      -- Member access
      (auth.role() = 'authenticated' AND id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      ))
    )
  );

-- Update invite code function for better error handling
CREATE OR REPLACE FUNCTION set_invite_code_context(input_code text)
RETURNS void AS $$
BEGIN
  -- Clear context if null/empty
  IF input_code IS NULL OR trim(input_code) = '' THEN
    PERFORM set_config('app.current_invite_code', NULL, true);
    RETURN;
  END IF;

  -- Set normalized code
  PERFORM set_config('app.current_invite_code', upper(trim(input_code)), true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION set_invite_code_context(text) TO public;