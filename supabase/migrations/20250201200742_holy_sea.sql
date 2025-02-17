/*
  # Fix Organization Creation Policies

  1. Changes
    - Drop existing organization policies
    - Add new simplified policies for organization management
    - Fix invite code handling
    - Add proper insert policy

  2. Security
    - Maintain RLS protection
    - Allow authenticated users to create organizations
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_update_policy" ON organizations;

-- Create simplified organization policies
CREATE POLICY "organizations_select"
  ON organizations
  FOR SELECT
  USING (
    is_active = true
    AND (
      -- Member access
      id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
      OR
      -- Invite code lookup
      upper(invite_code) = upper(current_setting('app.current_invite_code', true))
    )
  );

-- Allow authenticated users to create organizations
CREATE POLICY "organizations_insert"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Allow any authenticated user to create an organization

-- Allow organization members to update their organization
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
CREATE INDEX IF NOT EXISTS idx_organizations_invite_code_active 
ON organizations(invite_code) 
WHERE is_active = true;