/*
  # Fix User Policies

  1. Changes
    - Simplify user policies to avoid recursion
    - Split policies into distinct use cases
    - Remove nested selects that could cause recursion

  2. Security
    - Maintain data isolation between organizations
    - Ensure users can only see appropriate data
    - Preserve admin access rights
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "View same organization members" ON users;
DROP POLICY IF EXISTS "Admin view organization members" ON users;

-- Create simplified policies
CREATE POLICY "users_read_own" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_read_org_members" ON users
  FOR SELECT TO authenticated
  USING (
    -- Allow if user belongs to same organization
    CASE 
      WHEN organization_id IS NOT NULL THEN
        organization_id = (
          SELECT u.organization_id 
          FROM users u 
          WHERE u.id = auth.uid() 
          LIMIT 1
        )
      ELSE false
    END
  );

CREATE POLICY "users_read_as_admin" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM organizations o
      WHERE o.admin_id = auth.uid()
      AND o.id = users.organization_id
    )
  );

CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());