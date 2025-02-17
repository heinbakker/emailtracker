-- Drop and recreate the constraint to include 'ten_stars'
ALTER TABLE default_icons 
  DROP CONSTRAINT IF EXISTS valid_icon_type;

ALTER TABLE default_icons 
  ADD CONSTRAINT valid_icon_type 
  CHECK (type IN ('stars', 'thumbs', 'smileys', 'ten_stars'));

-- Re-insert the star icon
INSERT INTO default_icons (type, value, url)
VALUES (
  'ten_stars',
  0,
  'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/stars/star.png'
)
ON CONFLICT (type, value) 
DO UPDATE SET url = EXCLUDED.url;