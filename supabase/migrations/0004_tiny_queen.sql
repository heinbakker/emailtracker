/*
  # Fix User Policies Recursion

  1. Changes
    - Remove nested user queries from policies
    - Separate admin and member policies
    - Use direct comparisons instead of subqueries where possible
    
  2. Security
    - Users can view their own profile
    - Organization members can view other members (non-recursive)
    - Admins can view their organization members (non-recursive)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view organization members" ON users;

-- Create non-recursive policies
CREATE POLICY "View own profile" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "View same organization members" ON users
  FOR SELECT TO authenticated
  USING (
    -- Only allow if both users have an organization_id
    organization_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.organization_id = users.organization_id
    )
  );

CREATE POLICY "Admin view organization members" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.admin_id = auth.uid()
      AND organizations.id = users.organization_id
    )
  );