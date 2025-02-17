/*
  # Fix Organization Policies and Functions

  1. Changes
    - Drop existing organization policies
    - Create new simplified policies for organizations
    - Add proper RLS for organization creation
    - Fix user update policy for organization joining

  2. Security
    - Enable RLS on all tables
    - Add proper policies for organization access
    - Add policies for user updates
*/

-- Drop existing organization policies
DROP POLICY IF EXISTS "organizations_read_public" ON organizations;
DROP POLICY IF EXISTS "organizations_read_member" ON organizations;
DROP POLICY IF EXISTS "organizations_insert" ON organizations;

-- Create simplified organization policies
CREATE POLICY "organizations_select"
  ON organizations
  FOR SELECT
  USING (
    is_active = true
    AND (
      -- Allow lookup by invite code
      upper(invite_code) = upper(current_setting('app.current_invite_code', true))
      OR
      -- Allow members to view their organization
      id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
    )
  );

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

-- Update user policies
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_update" ON users;

CREATE POLICY "users_select"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Can read own profile
    id = auth.uid()
    OR
    -- Can read profiles in same organization
    EXISTS (
      SELECT 1 
      FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.organization_id = users.organization_id
      AND users.organization_id IS NOT NULL
    )
  );

CREATE POLICY "users_update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND (
      -- Allow if:
      organization_id IS NULL -- Not joining any org
      OR
      organization_id = ( -- Staying in current org
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
      OR
      EXISTS ( -- Joining via invite code
        SELECT 1 
        FROM organizations o
        WHERE o.id = organization_id
        AND o.is_active = true
        AND upper(o.invite_code) = upper(current_setting('app.current_invite_code', true))
      )
    )
  );

-- Drop existing functions first
DROP FUNCTION IF EXISTS normalize_invite_code(text);
DROP FUNCTION IF EXISTS set_invite_code_context(text);

-- Create function to normalize invite codes
CREATE FUNCTION normalize_invite_code(text)
RETURNS text AS $$
BEGIN
  RETURN upper(trim($1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to set invite code context
CREATE FUNCTION set_invite_code_context(text)
RETURNS void AS $$
BEGIN
  -- Normalize and store invite code
  PERFORM set_config('app.current_invite_code', COALESCE(upper(trim($1)), ''), true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public for registration flow
GRANT EXECUTE ON FUNCTION set_invite_code_context(text) TO public;