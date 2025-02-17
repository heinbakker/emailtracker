/*
  # Fix Organization Policies for Registration

  1. Changes
    - Allow public access to organizations by invite code
    - Keep authenticated member access
    - Simplify policy structure

  2. Security
    - Maintain RLS
    - Only expose minimal required data for registration
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "organizations_read_as_member" ON organizations;

-- Create new policy that allows both:
-- 1. Public access for registration (invite code lookup)
-- 2. Authenticated member access
CREATE POLICY "organizations_access_policy" ON organizations
  FOR SELECT
  USING (
    -- Allow if looking up by invite code (public or authenticated)
    upper(invite_code) = upper(current_setting('app.current_invite_code', true))
    OR
    -- Or if authenticated user is a member
    (
      auth.role() = 'authenticated' 
      AND 
      id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
    )
  );

-- Update the invite code context function to be available to the public
DROP FUNCTION IF EXISTS set_invite_code_context(input_code text);

CREATE OR REPLACE FUNCTION set_invite_code_context(input_code text)
RETURNS void AS $$
BEGIN
  -- Normalize and store invite code
  PERFORM set_config('app.current_invite_code', COALESCE(upper(trim(input_code)), ''), true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION set_invite_code_context(text) TO public;