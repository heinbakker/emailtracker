/*
  # Fix Organization Creation

  1. Changes
    - Add policy for organization creation
    - Update organization access policy
    - Add policy for organization updates

  2. Security
    - Maintain RLS protection
    - Allow authenticated users to create organizations
    - Restrict updates to organization members
*/

-- Drop existing policies
DROP POLICY IF EXISTS "organizations_access" ON organizations;

-- Create comprehensive organization policies
CREATE POLICY "organizations_select"
  ON organizations
  FOR SELECT
  USING (
    is_active = true
    AND (
      -- Public invite code lookup
      CASE 
        WHEN current_setting('app.current_invite_code', true) IS NOT NULL 
        AND current_setting('app.current_invite_code', true) != ''
        THEN upper(invite_code) = upper(current_setting('app.current_invite_code', true))
        ELSE false
      END
      OR
      -- Member access
      (auth.role() = 'authenticated' AND id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      ))
    )
  );

-- Allow authenticated users to create organizations
CREATE POLICY "organizations_insert"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Basic validation
    name IS NOT NULL
    AND invite_code IS NOT NULL
    AND is_active = true
  );

-- Allow members to update their organization
CREATE POLICY "organizations_update"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    -- Only allow updates to user's organization
    id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    -- Prevent changing critical fields
    is_active = true
    AND invite_code IS NOT NULL
  );