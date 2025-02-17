/*
  # Allow anonymous ratings
  
  1. Changes
    - Remove authentication requirement for ratings
    - Add policy to allow public rating submissions
    - Keep existing policies for authenticated users
  
  2. Security
    - Enable RLS
    - Add policy for public rating creation
    - Maintain existing policies for authenticated users
*/

-- Update ratings policies to allow anonymous submissions
DROP POLICY IF EXISTS "Users can create own ratings" ON ratings;

CREATE POLICY "Allow public rating submissions" ON ratings
  FOR INSERT
  WITH CHECK (true);

-- Keep existing select policies
DROP POLICY IF EXISTS "Users can read own ratings" ON ratings;
DROP POLICY IF EXISTS "Organization admins can read org ratings" ON ratings;

CREATE POLICY "Users can read own ratings" ON ratings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organization admins can read org ratings" ON ratings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = ratings.user_id
      AND o.admin_id = auth.uid()
    )
  );