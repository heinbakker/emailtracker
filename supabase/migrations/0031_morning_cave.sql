/*
  # Add custom rating type and update constraints

  1. Changes
    - Add 'custom' to rating_type enum
    - Update rating value constraint to support all rating types
    - Add index for faster rating link lookups
    
  2. Security
    - No changes to RLS policies
*/

-- Wrap in transaction for atomicity
BEGIN;

-- Add custom type if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'rating_type' 
    AND 'custom' = ANY(enum_range(NULL::rating_type)::text[])
  ) THEN
    ALTER TYPE rating_type ADD VALUE IF NOT EXISTS 'custom';
  END IF;
END $$;

-- Update rating value constraint
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS valid_rating_value;
ALTER TABLE ratings ADD CONSTRAINT valid_rating_value CHECK (
  (type = 'stars' AND value BETWEEN 1 AND 5) OR
  (type = 'custom' AND value IN (1, 3, 4, 5)) OR
  (type = 'smileys' AND value IN (1, 3, 5)) OR
  (type = 'ten_stars' AND value BETWEEN 1 AND 10)
);

-- Add index for faster rating link lookups
CREATE INDEX IF NOT EXISTS idx_rating_links_code ON rating_links(code) WHERE is_active = true;

COMMIT;