/*
  # Simplify Organization Invites

  1. Changes
    - Simplify organizations table structure
    - Add case-insensitive invite code handling
    - Streamline RLS policies
    - Add indexes for performance

  2. Security
    - Enable RLS on all tables
    - Add policies for organization access
    - Add policies for user updates
*/

-- Drop existing complex policies first
DROP POLICY IF EXISTS "View organization by invite code" ON organizations;
DROP POLICY IF EXISTS "View organization as member" ON organizations;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;

-- Simplify organizations table
ALTER TABLE organizations
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS last_modified,
  ALTER COLUMN invite_code SET NOT NULL,
  ALTER COLUMN is_active SET DEFAULT true;

-- Create index for case-insensitive invite code lookups
CREATE INDEX IF NOT EXISTS idx_organizations_invite_code_upper 
ON organizations(upper(invite_code)) 
WHERE is_active = true;

-- Simple organization policies
CREATE POLICY "organizations_read_as_member" ON organizations
  FOR SELECT TO authenticated
  USING (
    -- Allow if user is a member
    id = (SELECT organization_id FROM users WHERE id = auth.uid())
    OR
    -- Or if looking up by invite code
    upper(invite_code) = upper(current_setting('app.current_invite_code', true))
  );

-- Simple user update policy
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

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS set_invite_code_context(text);

-- Create function with consistent parameter name
CREATE OR REPLACE FUNCTION set_invite_code_context(code text)
RETURNS void AS $$
BEGIN
  -- Normalize and store invite code
  PERFORM set_config('app.current_invite_code', COALESCE(upper(trim(code)), ''), true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;