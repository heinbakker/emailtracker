-- Drop existing policies
DROP POLICY IF EXISTS "Allow public rating submissions" ON ratings;

-- Create a more permissive policy for rating submissions
CREATE POLICY "Allow anonymous rating submissions" ON ratings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_id
    )
  );

-- Add index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);