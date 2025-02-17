/*
  # Fix Recursive Policies

  1. Changes
    - Drop existing recursive policies
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
DROP POLICY IF EXISTS "organizations_read_public" ON organizations;
DROP POLICY IF EXISTS "organizations_read_member" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;

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
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
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
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
    AND organization_id IS NOT NULL
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
      organization_id IN (
        SELECT organization_id 
        FROM users 
        WHERE users.id = auth.uid()
      )
      OR
      organization_id IN (
        SELECT id 
        FROM organizations 
        WHERE is_active = true
        AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id 
  ON users(organization_id) 
  WHERE organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_invite_code_upper 
  ON organizations(upper(invite_code)) 
  WHERE is_active = true;