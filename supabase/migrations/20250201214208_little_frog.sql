/*
  # Organization and Department Schema

  1. New Tables
    - organizations
      - id (uuid, primary key)
      - name (text)
      - invite_code (text, unique)
      - is_active (boolean)
      - created_at (timestamptz)
    
    - departments
      - id (uuid, primary key)
      - organization_id (uuid, foreign key)
      - name (text)
      - created_at (timestamptz)
    
    - department_memberships
      - id (uuid, primary key)
      - department_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - role (text: member/manager)
      - created_at (timestamptz)

  2. Changes
    - Add organization_id and role to users table
    - Add department_id to users table
    
  3. Security
    - Enable RLS on all tables
    - Add policies for organization access
    - Add policies for department access
*/

-- Create organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create departments table
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Create department memberships table
CREATE TABLE department_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES departments(id),
  user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('member', 'manager')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(department_id, user_id)
);

-- Add organization and role columns to users
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id),
  ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES departments(id);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_memberships ENABLE ROW LEVEL SECURITY;

-- Organization Policies
CREATE POLICY "organizations_read_public"
  ON organizations
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
  );

CREATE POLICY "organizations_read_member"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
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

-- Department Policies
CREATE POLICY "departments_read"
  ON departments
  FOR SELECT
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "departments_insert"
  ON departments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );

-- Department Membership Policies
CREATE POLICY "department_memberships_read"
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

CREATE POLICY "department_memberships_manage"
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_invite_code_upper 
  ON organizations(upper(invite_code)) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_organization_id 
  ON users(organization_id) 
  WHERE organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_departments_organization_id 
  ON departments(organization_id);

CREATE INDEX IF NOT EXISTS idx_department_memberships_user_id 
  ON department_memberships(user_id);

-- Update user creation trigger to handle organization data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, organization_id, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    NULLIF(new.raw_user_meta_data->>'organization_id', '')::uuid,
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ language plpgsql security definer;