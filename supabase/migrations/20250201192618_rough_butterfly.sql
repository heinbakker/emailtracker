/*
  # Fix user update policies and indexing

  1. Changes
    - Add policy for users to update their own organization_id
    - Add function to handle invite code context
    - Add index for user lookups without auth.uid() function
*/

-- First ensure users can update their own organization_id
DROP POLICY IF EXISTS "users_update_own" ON users;

CREATE POLICY "users_can_update_own_profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND (
      -- Allow setting organization_id if:
      organization_id IS NULL -- User isn't in an org yet
      OR
      organization_id = ( -- User is already in this org
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
      OR
      EXISTS ( -- Organization exists and has matching invite code
        SELECT 1 
        FROM organizations o
        WHERE o.id = organization_id
        AND o.invite_code = current_setting('app.current_invite_code', true)
      )
    )
  );

-- Add index for faster user lookups (without using auth.uid())
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Ensure invite code context is properly handled
CREATE OR REPLACE FUNCTION set_invite_code_context(invite_code text)
RETURNS void AS $$
BEGIN
  -- Handle null case properly
  IF invite_code IS NULL THEN
    PERFORM set_config('app.current_invite_code', '', true);
  ELSE
    PERFORM set_config('app.current_invite_code', invite_code, true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;