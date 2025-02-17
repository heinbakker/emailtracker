-- Update default_icons URLs to match storage paths
UPDATE default_icons
SET url = CASE value
  WHEN 5 THEN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/happy.png'
  WHEN 3 THEN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/neutral.png'
  WHEN 1 THEN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/smileys/sad.png'
END
WHERE type = 'smileys';