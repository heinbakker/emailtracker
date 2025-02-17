/*
  # Update organizations table structure
  
  1. Changes
    - Update existing policies to remove admin_id dependencies
    - Remove admin_id requirement
    - Add description field
    - Add active status field
    - Add last_modified timestamp
  
  2. Security
    - Update RLS policies for manual administration
*/

-- First, drop dependent policies
DROP POLICY IF EXISTS "Organization admins can read org images" ON images;
DROP POLICY IF EXISTS "Organization admins can read org ratings" ON ratings;
DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;
DROP POLICY IF EXISTS "Organizations can be created by authenticated users" ON organizations;

-- Create new policies that don't depend on admin_id
CREATE POLICY "Organization members can read org images"
  ON images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = images.user_id
      AND u.organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can read org ratings"
  ON ratings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = ratings.user_id
      AND u.organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Organizations are viewable by members"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Now we can safely modify the organizations table
ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_admin_id_fkey,
  DROP COLUMN IF EXISTS admin_id,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_modified timestamptz DEFAULT now();

-- Create trigger to update last_modified
CREATE OR REPLACE FUNCTION update_organizations_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_update_last_modified
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organizations_last_modified();