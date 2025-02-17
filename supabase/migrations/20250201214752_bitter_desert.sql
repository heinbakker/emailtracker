/*
  # Clean up department structure

  1. Changes
    - Drop dependent policies first
    - Remove unused department_id from users
    - Add simplified department policies
    - Add proper indexes

  2. Security
    - Ensure proper RLS for all department-related operations
*/

-- First drop dependent policies
DROP POLICY IF EXISTS "department_memberships_read" ON department_memberships;
DROP POLICY IF EXISTS "department_memberships_manage" ON department_memberships;
DROP POLICY IF EXISTS "departments_read" ON departments;
DROP POLICY IF EXISTS "departments_insert" ON departments;

-- Now we can safely remove the column
ALTER TABLE users 
  DROP COLUMN IF EXISTS department_id;

-- Create simplified department policies
CREATE POLICY "dept_read"
  ON departments
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "dept_insert"
  ON departments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Create simplified membership policies
CREATE POLICY "dept_membership_read"
  ON department_memberships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM departments d
      JOIN users u ON u.organization_id = d.organization_id
      WHERE d.id = department_id
      AND u.id = auth.uid()
    )
  );

CREATE POLICY "dept_membership_manage"
  ON department_memberships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM department_memberships dm
      JOIN departments d ON d.id = dm.department_id
      WHERE dm.department_id = department_memberships.department_id
      AND dm.user_id = auth.uid()
      AND dm.role = 'manager'
    )
  );

-- Add index for department membership lookups
CREATE INDEX IF NOT EXISTS idx_dept_memberships_lookup 
  ON department_memberships(department_id, user_id);