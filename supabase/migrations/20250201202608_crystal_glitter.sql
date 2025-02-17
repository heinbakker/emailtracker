/*
  # Fix Recursive Policies
  
  1. Changes
    - Drop existing recursive policies
    - Create simple, non-recursive policies
    - Fix organization access
    
  2. Security
    - Allow organization lookup by invite code
    - Allow members to view their organization
    - Allow users to update their profile
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "users_read" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "organizations_read" ON organizations;
DROP POLICY IF EXISTS "organizations_create" ON organizations;
DROP POLICY IF EXISTS "organizations_update" ON organizations;

-- Create non-recursive user policies
CREATE POLICY "users_read_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_read_org_members"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND organization_id = (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.id = auth.uid()
      LIMIT 1
    )
  );

CREATE POLICY "users_update_own"
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
        SELECT u.organization_id 
        FROM users u 
        WHERE u.id = auth.uid()
        LIMIT 1
      )
      OR
      EXISTS (
        SELECT 1 
        FROM organizations o
        WHERE o.id = organization_id
        AND o.is_active = true
        AND upper(o.invite_code) = upper(current_setting('app.current_invite_code', true))
      )
    )
  );

-- Create simple organization policies
CREATE POLICY "organizations_read_by_code"
  ON organizations
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
  );

CREATE POLICY "organizations_read_as_member"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id = (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.id = auth.uid()
      LIMIT 1
    )
  );

CREATE POLICY "organizations_insert"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    name IS NOT NULL
    AND invite_code IS NOT NULL
    AND is_active = true
  );

CREATE POLICY "organizations_update_as_member"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    id = (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.id = auth.uid()
      LIMIT 1
    )
  )
  WITH CHECK (
    is_active = true
    AND invite_code IS NOT NULL
  );

-- Create index for faster invite code lookups
DROP INDEX IF EXISTS idx_organizations_invite_code_upper_active;
CREATE INDEX idx_organizations_invite_code_upper_active 
ON organizations(upper(invite_code)) 
WHERE is_active = true;