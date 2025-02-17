/*
  # Department Management Policies

  1. Changes
    - Add policies for department management
    - Add policies for department membership management
    - Add function to check if user is organization member

  2. Security
    - Only organization members can manage departments
    - Department managers can manage memberships
    - All organization members can view departments
*/

-- Create helper function to check if user is in organization
CREATE OR REPLACE FUNCTION is_organization_member(org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing department policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view departments in their organization" ON departments;
DROP POLICY IF EXISTS "Department managers can create departments" ON departments;

-- Create comprehensive department policies
CREATE POLICY "department_view_policy" ON departments
  FOR SELECT
  USING (is_organization_member(organization_id));

CREATE POLICY "department_insert_policy" ON departments
  FOR INSERT
  WITH CHECK (is_organization_member(organization_id));

CREATE POLICY "department_update_policy" ON departments
  FOR UPDATE
  USING (is_organization_member(organization_id))
  WITH CHECK (is_organization_member(organization_id));

CREATE POLICY "department_delete_policy" ON departments
  FOR DELETE
  USING (is_organization_member(organization_id));

-- Drop existing membership policies
DROP POLICY IF EXISTS "Users can view department memberships" ON department_memberships;
DROP POLICY IF EXISTS "Department managers can manage memberships" ON department_memberships;

-- Create comprehensive membership policies
CREATE POLICY "membership_view_policy" ON department_memberships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM departments d
      WHERE d.id = department_id
      AND is_organization_member(d.organization_id)
    )
  );

CREATE POLICY "membership_manage_policy" ON department_memberships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM department_memberships dm
      JOIN departments d ON d.id = dm.department_id
      WHERE dm.department_id = department_memberships.department_id
      AND dm.user_id = auth.uid()
      AND dm.role = 'manager'
      AND is_organization_member(d.organization_id)
    )
  );

-- Drop existing permission policies
DROP POLICY IF EXISTS "Users can view their own permissions" ON department_permissions;
DROP POLICY IF EXISTS "Department managers can manage permissions" ON department_permissions;

-- Create comprehensive permission policies
CREATE POLICY "permission_view_policy" ON department_permissions
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 
      FROM department_memberships dm
      JOIN departments d ON d.id = dm.department_id
      WHERE dm.department_id = department_permissions.department_id
      AND dm.user_id = auth.uid()
      AND dm.role = 'manager'
      AND is_organization_member(d.organization_id)
    )
  );

CREATE POLICY "permission_manage_policy" ON department_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM department_memberships dm
      JOIN departments d ON d.id = dm.department_id
      WHERE dm.department_id = department_permissions.department_id
      AND dm.user_id = auth.uid()
      AND dm.role = 'manager'
      AND is_organization_member(d.organization_id)
    )
  );