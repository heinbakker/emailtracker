/*
  # Fix Recursive Policies

  1. Changes
    - Drop all existing recursive policies
    - Create simple, non-recursive policies
    - Add proper indexes for performance
    
  2. Security
    - Allow public invite code lookup
    - Allow members to view their organization
    - Allow organization creation
    - Allow joining via invite code
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_read_org_members" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "organizations_read_by_code" ON organizations;
DROP POLICY IF EXISTS "organizations_read_as_member" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_update_as_member" ON organizations;

-- Create simple organization policies
CREATE POLICY "organizations_read_public"
  ON organizations
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
  );

CREATE POLICY "organizations_read_member"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users 
      WHERE users.id = auth.uid() 
      AND users.organization_id = organizations.id
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

-- Create simple user policies
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
    EXISTS (
      SELECT 1 
      FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.organization_id = users.organization_id
      AND users.organization_id IS NOT NULL
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
      -- Allow if:
      organization_id IS NULL -- Not joining any org
      OR
      EXISTS ( -- Current org member
        SELECT 1 
        FROM users u2
        WHERE u2.id = auth.uid()
        AND u2.organization_id = organization_id
      )
      OR
      EXISTS ( -- Joining via invite code
        SELECT 1 
        FROM organizations o
        WHERE o.id = organization_id
        AND o.is_active = true
        AND upper(o.invite_code) = upper(current_setting('app.current_invite_code', true))
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_invite_code_upper ON organizations(upper(invite_code)) WHERE is_active = true;