/*
  # Organization and Department System Update

  1. Changes
    - Remove organization creation ability from users
    - Add departments table with organization relationship
    - Add department memberships table
    - Add department permissions table
    
  2. Security
    - Enable RLS on new tables
    - Add policies for department access
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Create department memberships table
CREATE TABLE IF NOT EXISTS department_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES departments(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('member', 'manager')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(department_id, user_id)
);

-- Create department permissions table
CREATE TABLE IF NOT EXISTS department_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES departments(id),
  user_id uuid NOT NULL REFERENCES users(id),
  can_view_results boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(department_id, user_id)
);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_permissions ENABLE ROW LEVEL SECURITY;

-- Department policies
CREATE POLICY "Users can view departments in their organization"
  ON departments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Department managers can create departments"
  ON departments
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Department membership policies
CREATE POLICY "Users can view department memberships"
  ON department_memberships
  FOR SELECT
  USING (
    department_id IN (
      SELECT d.id 
      FROM departments d
      JOIN users u ON u.organization_id = d.organization_id
      WHERE u.id = auth.uid()
    )
  );

CREATE POLICY "Department managers can manage memberships"
  ON department_memberships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM department_memberships dm
      WHERE dm.department_id = department_id
      AND dm.user_id = auth.uid()
      AND dm.role = 'manager'
    )
  );

-- Department permissions policies
CREATE POLICY "Users can view their own permissions"
  ON department_permissions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Department managers can manage permissions"
  ON department_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 
      FROM department_memberships dm
      WHERE dm.department_id = department_id
      AND dm.user_id = auth.uid()
      AND dm.role = 'manager'
    )
  );