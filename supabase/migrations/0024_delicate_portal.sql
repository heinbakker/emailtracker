/*
  # Fix icon URLs to match storage paths

  Updates the URLs in default_icons table to match the actual storage paths
*/

UPDATE default_icons
SET url = CASE value
  WHEN 5 THEN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/happy'
  WHEN 3 THEN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/neutral'
  WHEN 1 THEN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/sad'
END
WHERE type = 'smileys';