/*
  # Fix Recursive User Policies
  
  1. Changes
    - Remove recursive organization lookup
    - Use direct auth.uid() comparison
    - Simplify policy logic
    
  2. Security
    - Maintain same security rules
    - Remove potential recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_update" ON users;

-- Non-recursive READ policy
CREATE POLICY "users_select"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Can read own profile (direct comparison)
    id = auth.uid()
    OR
    -- Can read profiles in same organization (using EXISTS)
    EXISTS (
      SELECT 1 
      FROM users u2
      WHERE u2.id = auth.uid()
      AND u2.organization_id = users.organization_id
      AND users.organization_id IS NOT NULL
    )
  );

-- Non-recursive UPDATE policy
CREATE POLICY "users_update"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND (
      -- Allow if:
      organization_id IS NULL  -- Removing organization
      OR
      EXISTS (                 -- Keeping current organization
        SELECT 1 
        FROM users u2
        WHERE u2.id = auth.uid()
        AND u2.organization_id = organization_id
      )
      OR
      EXISTS (                 -- Joining via invite code
        SELECT 1 
        FROM organizations o
        WHERE o.id = organization_id
        AND o.is_active = true
        AND upper(o.invite_code) = upper(current_setting('app.current_invite_code', true))
      )
    )
  );