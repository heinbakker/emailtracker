/*
  # Remove Organization Dependencies
  
  1. Changes
    - Drop dependent policies first
    - Remove organization-related columns and constraints
    - Create simple user policies
    
  2. Security
    - Basic user authentication only
    - Users can only access their own data
*/

-- First drop all dependent policies
DROP POLICY IF EXISTS "Organization members can read org images" ON images;
DROP POLICY IF EXISTS "Organization members can read org ratings" ON ratings;
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_update" ON users;

-- Drop organization-related tables and dependencies
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS department_memberships CASCADE;
DROP TABLE IF EXISTS department_permissions CASCADE;

-- Drop organization-related columns from users
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_organization_id_fkey CASCADE,
  DROP COLUMN IF EXISTS organization_id CASCADE,
  DROP COLUMN IF EXISTS role CASCADE;

-- Create simple user policies
CREATE POLICY "users_select"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Update user creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email)
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create simple policies for images
CREATE POLICY "users_can_read_own_images"
  ON images
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create simple policies for ratings
CREATE POLICY "users_can_read_own_ratings"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());