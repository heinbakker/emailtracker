/*
  # Simplified User Policies
  
  1. Changes
    - Drop existing complex user policies
    - Create simple, permissive policies
    - Focus on basic functionality
    
  2. Security
    - Allow users to read their own profile
    - Allow users to read profiles in their organization
    - Allow users to update their own profile
    - Allow joining organizations via invite code
*/

-- Drop existing user policies
DROP POLICY IF EXISTS "users_read" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "users_read_org_members" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Simple READ policy
CREATE POLICY "users_select"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Can read own profile
    id = auth.uid()
    OR
    -- Can read profiles in same organization
    (
      organization_id IS NOT NULL 
      AND organization_id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
    )
  );

-- Simple UPDATE policy
CREATE POLICY "users_update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND (
      -- Allow if:
      organization_id IS NULL  -- Removing organization
      OR
      organization_id = (      -- Keeping current organization
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
      OR
      EXISTS (                 -- Joining via invite code
        SELECT 1 
        FROM organizations 
        WHERE id = organization_id
        AND is_active = true
        AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
      )
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_organization_lookup 
ON users(organization_id) 
WHERE organization_id IS NOT NULL;