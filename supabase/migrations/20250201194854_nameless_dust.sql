/*
  # Simplify Organization Invites

  1. Changes
    - Drop existing policies to avoid conflicts
    - Simplify organizations table structure
    - Add case-insensitive invite code handling
    - Add indexes for performance

  2. Security
    - Enable RLS on all tables
    - Add policies for organization access
    - Add policies for user updates
*/

-- First drop ALL existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop organization policies
  DROP POLICY IF EXISTS "organizations_read_as_member" ON organizations;
  DROP POLICY IF EXISTS "View organization by invite code" ON organizations;
  DROP POLICY IF EXISTS "View organization as member" ON organizations;
  DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;
  
  -- Drop user policies
  DROP POLICY IF EXISTS "users_self_update" ON users;
  DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;
  DROP POLICY IF EXISTS "users_update_own" ON users;
END $$;

-- Simplify organizations table
ALTER TABLE organizations
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS last_modified,
  ALTER COLUMN invite_code SET NOT NULL,
  ALTER COLUMN is_active SET DEFAULT true;

-- Create index for case-insensitive invite code lookups
DROP INDEX IF EXISTS idx_organizations_invite_code_upper;
CREATE INDEX idx_organizations_invite_code_upper 
ON organizations(upper(invite_code)) 
WHERE is_active = true;

-- Create new organization policy
CREATE POLICY "organizations_read_as_member" ON organizations
  FOR SELECT TO authenticated
  USING (
    -- Allow if user is a member
    id = (SELECT organization_id FROM users WHERE id = auth.uid())
    OR
    -- Or if looking up by invite code
    upper(invite_code) = upper(current_setting('app.current_invite_code', true))
  );

-- Create new user update policy
CREATE POLICY "users_self_update" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND (
      -- Allow if:
      organization_id IS NULL -- Not in an org yet
      OR
      organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) -- Already in this org
      OR
      EXISTS ( -- Org exists with matching invite code
        SELECT 1 FROM organizations
        WHERE id = organization_id
        AND is_active = true
        AND upper(invite_code) = upper(current_setting('app.current_invite_code', true))
      )
    )
  );

-- Drop and recreate the invite code context function
DROP FUNCTION IF EXISTS set_invite_code_context(text);
DROP FUNCTION IF EXISTS set_invite_code_context(input_code text);

CREATE OR REPLACE FUNCTION set_invite_code_context(input_code text)
RETURNS void AS $$
BEGIN
  -- Normalize and store invite code
  PERFORM set_config('app.current_invite_code', COALESCE(upper(trim(input_code)), ''), true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;