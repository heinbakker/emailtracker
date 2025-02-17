/*
  # Fix organization policies to prevent recursion

  1. Changes
    - Drop existing recursive policy
    - Create new non-recursive policies for organization access
    - Add index for faster invite code lookups
    - Simplify organization member checks
*/

-- First drop the existing problematic policy
DROP POLICY IF EXISTS "Allow organization lookup by invite code" ON organizations;
DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;

-- Create separate policies for different access patterns
CREATE POLICY "View organization by invite code"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    invite_code = current_setting('app.current_invite_code', true)
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

-- Add index for faster invite code lookups
CREATE INDEX IF NOT EXISTS idx_organizations_invite_code 
  ON organizations(invite_code)
  WHERE is_active = true;