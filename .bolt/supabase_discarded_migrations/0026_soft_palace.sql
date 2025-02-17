/*
  # Update rating types and constraints
  
  1. Changes
    - Updates constraints for icon values
    - Adds support for custom icons
    - Preserves existing data
    
  2. Details
    - Updates constraints without violating data integrity
    - Adds new rating types safely
*/

-- Wrap everything in a transaction
BEGIN;

-- First handle the default_icons table
ALTER TABLE default_icons DROP CONSTRAINT IF EXISTS valid_icon_type;
ALTER TABLE default_icons DROP CONSTRAINT IF EXISTS valid_smiley_value;
ALTER TABLE default_icons DROP CONSTRAINT IF EXISTS valid_icon_values;

-- Add new constraints for default_icons
ALTER TABLE default_icons ADD CONSTRAINT valid_icon_type 
  CHECK (type IN ('stars', 'thumbs', 'smileys', 'custom', 'ten_stars'));

ALTER TABLE default_icons ADD CONSTRAINT valid_icon_values CHECK (
  (type = 'smileys' AND value IN (1, 3, 5)) OR
  (type = 'custom' AND value IN (1, 3, 4, 5)) OR
  (type = 'ten_stars' AND value = 0) OR
  (type NOT IN ('smileys', 'custom', 'ten_stars'))
);

-- Update the ratings table constraints
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS valid_rating_value;
ALTER TABLE ratings ADD CONSTRAINT valid_rating_value CHECK (
  (type = 'stars' AND value BETWEEN 1 AND 5) OR
  (type = 'thumbs' AND value BETWEEN 0 AND 2) OR
  (type = 'smileys' AND value IN (1, 3, 5)) OR
  (type = 'custom' AND value IN (1, 3, 4, 5)) OR
  (type = 'ten_stars' AND value BETWEEN 1 AND 10)
);

-- Drop and recreate the type if it exists
DO $$ 
BEGIN
  DROP TYPE IF EXISTS rating_type CASCADE;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rating_type') THEN
    CREATE TYPE rating_type AS ENUM ('stars', 'thumbs', 'smileys', 'custom', 'ten_stars');
  END IF;
END $$;

COMMIT;