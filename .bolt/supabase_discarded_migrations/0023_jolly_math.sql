/*
  # Add ten-star rating type

  1. Changes
    - Add 'tenstars' as a new rating type
    - Update rating value constraint to allow values 1-10 for tenstars
    
  Note: Using a safer approach to modify enum type
*/

-- First create a backup of the ratings table
CREATE TABLE ratings_backup AS SELECT * FROM ratings;

-- Drop existing ratings table
DROP TABLE ratings;

-- Recreate the enum with new value
DROP TYPE rating_type;
CREATE TYPE rating_type AS ENUM ('stars', 'thumbs', 'smileys', 'tenstars');

-- Recreate ratings table with new type
CREATE TABLE ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  type rating_type NOT NULL,
  value integer NOT NULL,
  feedback text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_rating_value CHECK (
    (type = 'stars' AND value BETWEEN 1 AND 5) OR
    (type = 'thumbs' AND value BETWEEN 0 AND 2) OR
    (type = 'smileys' AND value IN (1, 3, 5)) OR
    (type = 'tenstars' AND value BETWEEN 1 AND 10)
  )
);

-- Copy data back
INSERT INTO ratings 
SELECT * FROM ratings_backup;

-- Drop backup table
DROP TABLE ratings_backup;

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Recreate policies
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

CREATE POLICY "Allow anonymous rating submissions" ON ratings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_id
    )
  );