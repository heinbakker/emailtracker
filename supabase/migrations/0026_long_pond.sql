-- Wrap in a transaction to ensure atomic changes
BEGIN;

-- Add new rating type in a separate transaction
ALTER TYPE rating_type ADD VALUE 'ten_stars';

-- Commit the enum change first
COMMIT;

-- Start new transaction for constraint changes
BEGIN;

-- Update rating value constraint
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS valid_rating_value;
ALTER TABLE ratings ADD CONSTRAINT valid_rating_value CHECK (
  (type = 'stars' AND value BETWEEN 1 AND 5) OR
  (type = 'thumbs' AND value BETWEEN 0 AND 2) OR
  (type = 'smileys' AND value IN (1, 3, 5)) OR
  (type = 'ten_stars' AND value BETWEEN 1 AND 10)
);

COMMIT;