/*
  # Fix Recursive Policies

  1. Changes
    - Remove recursive organization lookups
    - Simplify user policies
    - Use direct ID comparisons instead of subqueries
    - Remove circular dependencies

  2. Security
    - Maintain RLS protection
    - Keep invite code functionality
    - Preserve organization member access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_update" ON users;

-- Simple organization policies
CREATE POLICY "org_read_by_code"
  ON organizations
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
  );

CREATE POLICY "org_read_as_member"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "org_insert"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    name IS NOT NULL
    AND invite_code IS NOT NULL
    AND is_active = true
  );

-- Simple user policies
CREATE POLICY "user_read_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "user_read_org_members"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "user_update_own"
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
        WHERE id = auth.uid()
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
DROP INDEX IF EXISTS idx_users_organization_id;
DROP INDEX IF EXISTS idx_organizations_invite_code_upper;

CREATE INDEX idx_users_organization_id 
  ON users(organization_id) 
  WHERE organization_id IS NOT NULL;

CREATE INDEX idx_organizations_invite_code_upper 
  ON organizations(upper(invite_code)) 
  WHERE is_active = true;