/*
  # Fix invite code handling

  1. Changes
    - Make invite code lookups case-insensitive
    - Add function to normalize invite codes
    - Update policies to use case-insensitive comparison
*/

-- Create function to normalize invite codes
CREATE OR REPLACE FUNCTION normalize_invite_code(code text)
RETURNS text AS $$
BEGIN
  RETURN upper(trim(code));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Drop existing policies
DROP POLICY IF EXISTS "View organization by invite code" ON organizations;
DROP POLICY IF EXISTS "View organization as member" ON organizations;

-- Create updated policies with case-insensitive comparison
CREATE POLICY "View organization by invite code"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    upper(invite_code) = upper(current_setting('app.current_invite_code', true))
  );

CREATE POLICY "View organization as member"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id = (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
      LIMIT 1
    )
  );

-- Update users policy to use case-insensitive comparison
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;

CREATE POLICY "users_can_update_own_profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND (
      organization_id IS NULL
      OR
      organization_id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 
        FROM organizations o
        WHERE o.id = organization_id
        AND upper(o.invite_code) = upper(current_setting('app.current_invite_code', true))
      )
    )
  );