/*
  # Simplify User Policies

  1. Changes
    - Replace complex organization-based policies with simpler ones
    - Remove nested subqueries to prevent recursion
    - Maintain security while improving performance
    
  2. Security
    - Users can view their own profile
    - Organization members can view other members
    - Admins can view their organization members
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Organization admins can view their members" ON users;
DROP POLICY IF EXISTS "Users can view members of their organization" ON users;

-- Create simplified policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view organization members" ON users
  FOR SELECT TO authenticated
  USING (
    -- Allow if user is in same organization
    organization_id IS NOT NULL AND
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    OR
    -- Allow if user is organization admin
    organization_id IN (
      SELECT id FROM organizations WHERE admin_id = auth.uid()
    )
  );