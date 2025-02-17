/*
  # Clean up icons

  1. Clean up
    - Delete all existing icons from storage
    - Delete all records from default_icons table
    - Reset storage policies

  2. Security
    - Maintain existing RLS policies
    - Keep bucket public
*/

-- Delete all existing icons from storage
DELETE FROM storage.objects
WHERE bucket_id = 'icons';

-- Delete all records from default_icons table
DELETE FROM default_icons;

-- Ensure storage bucket is clean and public
DO $$
BEGIN
  -- Update bucket to ensure it's public
  UPDATE storage.buckets
  SET public = true
  WHERE id = 'icons';
END $$;