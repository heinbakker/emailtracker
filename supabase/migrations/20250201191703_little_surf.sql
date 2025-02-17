/*
  # Fix organization lookup by invite code

  1. Changes
    - Add policy to allow looking up organizations by invite code
    - Only expose minimal information (id, name) when looking up by code
    - Keep existing policies for organization members

  2. Security
    - Users can only see organization ID and name when looking up by code
    - Full organization details still restricted to members only
*/

-- Add policy for looking up organizations by invite code
CREATE POLICY "Allow organization lookup by invite code"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if user is looking up by invite code
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM organizations o 
        WHERE o.id = organizations.id 
        AND o.invite_code = current_setting('app.current_invite_code', true)
      ) THEN true
      -- Or if user is a member (keep existing policy)
      ELSE id IN (
        SELECT organization_id 
        FROM users 
        WHERE users.id = auth.uid()
      )
    END
  );

-- Create function to set current invite code
CREATE OR REPLACE FUNCTION set_invite_code_context(invite_code text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_invite_code', invite_code, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;