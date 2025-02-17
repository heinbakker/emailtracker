/*
  # Fix user policies recursion

  1. Changes
    - Drop existing recursive policies
    - Create simple non-recursive policies
    - Add proper indexes for performance

  2. Security
    - Maintain proper RLS for user data
    - Ensure users can only read/update their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "user_read_own" ON users;
DROP POLICY IF EXISTS "user_read_org_members" ON users;
DROP POLICY IF EXISTS "user_update_own" ON users;

-- Create simple non-recursive policies
CREATE POLICY "users_read_own"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_id 
  ON users(id);