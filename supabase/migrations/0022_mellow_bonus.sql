/*
  # Fix icon URLs to match storage paths

  1. Changes
    - Update default_icons URLs to match the exact paths in storage
    - Remove .png extension from URLs since files are stored without it
*/

UPDATE default_icons
SET url = CASE value
  WHEN 5 THEN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/happy'
  WHEN 3 THEN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/neutral'
  WHEN 1 THEN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/sad'
END
WHERE type = 'smileys';