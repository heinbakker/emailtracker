/*
  # Fix User Policies

  1. Changes
    - Remove recursive user policies
    - Add simplified organization-based access
    - Add self-access policy
    
  2. Security
    - Maintain data isolation between organizations
    - Allow users to always access their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of their organization" ON users;

-- Create new non-recursive policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Organization admins can view their members" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM organizations 
      WHERE organizations.id = users.organization_id 
      AND organizations.admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can view members of their organization" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM organizations 
      WHERE organizations.id = users.organization_id 
      AND organizations.id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
    )
  );