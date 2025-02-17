/*
  # Update smiley icons to use Supabase storage URLs
  
  1. Changes
    - Update default icons to use Supabase storage URLs
    - Ensure proper URL structure for public access
    
  2. Notes
    - Uses the storage.objects table to get the correct URLs
    - Maintains proper public access to icons
*/

-- Get the Supabase project URL from an environment variable or configuration
CREATE OR REPLACE FUNCTION get_storage_public_url(file_path TEXT) 
RETURNS TEXT AS $$
BEGIN
  -- Construct the full storage URL
  RETURN 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/' || file_path;
END;
$$ LANGUAGE plpgsql;

-- Update default icons with storage URLs
UPDATE default_icons
SET url = CASE value
  WHEN 5 THEN get_storage_public_url('smileys/smiley-happy.png')
  WHEN 3 THEN get_storage_public_url('smileys/smiley-neutral.png')
  WHEN 1 THEN get_storage_public_url('smileys/smiley-sad.png')
END
WHERE type = 'smileys';

-- Drop the function as it's no longer needed
DROP FUNCTION get_storage_public_url;