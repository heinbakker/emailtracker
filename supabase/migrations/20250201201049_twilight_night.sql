/*
  # Fix Organization Policies

  1. Changes
    - Allow public access for invite code lookups
    - Allow authenticated users to create organizations
    - Fix organization member access
    - Add proper indexes

  2. Security
    - Maintain RLS protection
    - Allow public invite code verification
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_update" ON organizations;

-- Create policy for public invite code lookup
CREATE POLICY "organizations_public_lookup"
  ON organizations
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
  );

-- Create policy for member access
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

-- Allow any authenticated user to create organizations
CREATE POLICY "organizations_insert"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    name IS NOT NULL 
    AND invite_code IS NOT NULL
    AND is_active = true
  );

-- Allow members to update their organization
CREATE POLICY "organizations_update"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    is_active = true
    AND invite_code IS NOT NULL
  );

-- Create index for faster invite code lookups
DROP INDEX IF EXISTS idx_organizations_invite_code_active;
CREATE INDEX idx_organizations_invite_code_upper_active 
ON organizations(upper(invite_code)) 
WHERE is_active = true;