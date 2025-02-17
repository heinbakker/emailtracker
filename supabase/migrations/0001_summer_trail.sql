/*
  # Authentication Schema Setup

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `invite_code` (text, unique)
      - `admin_id` (uuid, references auth.users)
      - `created_at` (timestamp)
    
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `name` (text)
      - `organization_id` (uuid, references organizations)
      - `role` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for organization access
    - Add policies for user access
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  name text NOT NULL,
  organization_id uuid REFERENCES organizations(id),
  role text NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Organization Policies
CREATE POLICY "Organizations are viewable by members" ON organizations
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
    OR
    admin_id = auth.uid()
  );

CREATE POLICY "Organizations can be created by authenticated users" ON organizations
  FOR INSERT TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- User Policies
CREATE POLICY "Users can view members of their organization" ON users
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
    OR
    id = auth.uid()
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Function to handle new user creation
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

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();