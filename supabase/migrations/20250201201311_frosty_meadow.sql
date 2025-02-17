/*
  # Fix Organization Insert Policy
  
  1. Changes
    - Drop existing insert policy
    - Create new simplified insert policy
    - Add proper validation checks
    
  2. Security
    - Maintain RLS protection
    - Allow authenticated users to create organizations
    - Ensure proper data validation
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "organizations_insert" ON organizations;

-- Create a new, simpler insert policy
CREATE POLICY "organizations_insert"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Allow any authenticated user to create an organization

-- Add trigger to ensure data validity
CREATE OR REPLACE FUNCTION validate_organization_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure required fields
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'Organization name is required';
  END IF;

  -- Ensure invite code is set
  IF NEW.invite_code IS NULL OR trim(NEW.invite_code) = '' THEN
    RAISE EXCEPTION 'Invite code is required';
  END IF;

  -- Set default values
  NEW.is_active := true;
  NEW.invite_code := upper(trim(NEW.invite_code));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_organization_insert_trigger ON organizations;
CREATE TRIGGER validate_organization_insert_trigger
  BEFORE INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION validate_organization_insert();