/*
  # Convert thumbs ratings to custom type
  
  1. Changes
    - Updates existing thumbs ratings to use custom type
    - Maps old thumbs values to new custom values:
      * thumbs down (0) -> negative (1)
      * neutral (1) -> neutral (3)
      * thumbs up (2) -> excellent (5)
    
  2. Details
    - Preserves rating history by mapping to equivalent custom values
    - Updates type and values in a single transaction
*/

BEGIN;

-- Update existing thumbs ratings to custom type with mapped values
UPDATE ratings 
SET 
  type = 'custom',
  value = CASE 
    WHEN value = 0 THEN 1  -- thumbs down -> negative
    WHEN value = 1 THEN 3  -- neutral -> neutral
    WHEN value = 2 THEN 5  -- thumbs up -> excellent
  END
WHERE type = 'thumbs';

COMMIT;