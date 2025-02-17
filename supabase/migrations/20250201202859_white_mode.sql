/*
  # Fix Recursive Policies

  1. Changes
    - Drop all existing recursive policies
    - Create simple, non-recursive policies for users and organizations
    - Add proper indexes for performance
    
  2. Security
    - Allow public invite code lookup
    - Allow members to view their organization
    - Allow users to update their profile
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_read_org_members" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "organizations_read_public" ON organizations;
DROP POLICY IF EXISTS "organizations_read_member" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;

-- Create simple organization policies
CREATE POLICY "organizations_read"
  ON organizations
  FOR SELECT
  USING (
    is_active = true
    AND (
      -- Public invite code lookup
      upper(invite_code) = upper(current_setting('app.current_invite_code', true))
      OR
      -- Member access (non-recursive)
      EXISTS (
        SELECT 1 
        FROM users 
        WHERE users.id = auth.uid() 
        AND users.organization_id = organizations.id
      )
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
CREATE POLICY "users_read"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Can read own profile
    id = auth.uid()
    OR
    -- Can read members of same organization (non-recursive)
    (
      organization_id IS NOT NULL
      AND organization_id = (
        SELECT u2.organization_id
        FROM users u2
        WHERE u2.id = auth.uid()
      )
    )
  );

CREATE POLICY "users_update"
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
      organization_id = ( -- Staying in current org
        SELECT u2.organization_id
        FROM users u2
        WHERE u2.id = auth.uid()
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
DROP INDEX IF EXISTS idx_users_organization_id;
DROP INDEX IF EXISTS idx_organizations_invite_code_upper;

CREATE INDEX idx_users_organization_id 
  ON users(organization_id) 
  WHERE organization_id IS NOT NULL;

CREATE INDEX idx_organizations_invite_code_upper 
  ON organizations(upper(invite_code)) 
  WHERE is_active = true;