/*
  # Simplified User and Organization Policies
  
  1. Changes
    - Drop existing restrictive policies
    - Create simple, permissive policies
    - Allow organization creation and joining
    
  2. Security
    - Allow users to read/update their own profile
    - Allow organization lookup by invite code
    - Allow any authenticated user to create organizations
*/

-- Drop existing user policies
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_self_update" ON users;

-- Create simple user policies
CREATE POLICY "users_read"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own profile
    id = auth.uid()
    OR
    -- Users can read profiles in their organization
    organization_id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
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
      -- Allow clearing organization
      organization_id IS NULL
      OR
      -- Allow keeping current organization
      organization_id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
      OR
      -- Allow joining organization by invite code
      EXISTS (
        SELECT 1 
        FROM organizations 
        WHERE id = organization_id
        AND is_active = true
        AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
      )
    )
  );

-- Drop existing organization policies
DROP POLICY IF EXISTS "organizations_read" ON organizations;
DROP POLICY IF EXISTS "organizations_create" ON organizations;
DROP POLICY IF EXISTS "organizations_update" ON organizations;

-- Create simple organization policies
CREATE POLICY "organizations_read"
  ON organizations
  FOR SELECT
  USING (
    -- Organization is active
    is_active = true
    AND (
      -- Allow lookup by invite code
      upper(invite_code) = upper(current_setting('app.current_invite_code', true))
      OR
      -- Allow members to view their organization
      id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "organizations_create"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Allow any authenticated user to create

CREATE POLICY "organizations_update"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    -- Only members can update
    id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    -- Prevent disabling or removing invite code
    is_active = true
    AND invite_code IS NOT NULL
  );

-- Create index for faster invite code lookups
DROP INDEX IF EXISTS idx_organizations_invite_code_upper_active;
CREATE INDEX idx_organizations_invite_code_upper_active 
ON organizations(upper(invite_code)) 
WHERE is_active = true;