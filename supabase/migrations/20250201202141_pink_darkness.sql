/*
  # Clear CRUD Policies for Organizations
  
  1. Changes
    - Drop existing policies
    - Create clear CRUD policies for organizations
    - Add validation trigger
    - Add helper functions
    
  2. Security
    - Public can lookup organizations by invite code
    - Members can view their organization
    - Authenticated users can create organizations
    - Members can update their organization
    - No delete policy (soft delete via is_active)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "organizations_public_lookup" ON organizations;
DROP POLICY IF EXISTS "organizations_member_access" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;
DROP POLICY IF EXISTS "organizations_update" ON organizations;

-- CREATE policy
CREATE POLICY "organizations_create"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Any authenticated user can create an organization

-- READ policies
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

-- UPDATE policy
CREATE POLICY "organizations_update"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    -- Only members can update
    id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    -- Prevent disabling organization or removing invite code
    is_active = true
    AND invite_code IS NOT NULL
  );

-- Validation trigger
CREATE OR REPLACE FUNCTION validate_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- For inserts
  IF TG_OP = 'INSERT' THEN
    -- Validate name
    IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
      RAISE EXCEPTION 'Organization name is required';
    END IF;

    -- Validate and normalize invite code
    IF NEW.invite_code IS NULL OR trim(NEW.invite_code) = '' THEN
      RAISE EXCEPTION 'Invite code is required';
    END IF;

    -- Set defaults
    NEW.is_active := true;
    NEW.invite_code := upper(trim(NEW.invite_code));
  END IF;

  -- For updates
  IF TG_OP = 'UPDATE' THEN
    -- Prevent changing invite code to invalid value
    IF NEW.invite_code IS NULL OR trim(NEW.invite_code) = '' THEN
      RAISE EXCEPTION 'Cannot remove invite code';
    END IF;

    -- Normalize invite code
    NEW.invite_code := upper(trim(NEW.invite_code));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS validate_organization_trigger ON organizations;
CREATE TRIGGER validate_organization_trigger
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION validate_organization();

-- Create index for faster invite code lookups
DROP INDEX IF EXISTS idx_organizations_invite_code_upper_active;
CREATE INDEX idx_organizations_invite_code_upper_active 
ON organizations(upper(invite_code)) 
WHERE is_active = true;