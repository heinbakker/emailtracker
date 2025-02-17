/*
  # Add star icon to default_icons

  1. Changes
    - Add star icon entry to default_icons table
*/

INSERT INTO default_icons (type, value, url)
VALUES (
  'ten_stars',
  0,
  'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/stars/star.png'
)
ON CONFLICT (type, value) 
DO UPDATE SET url = EXCLUDED.url;