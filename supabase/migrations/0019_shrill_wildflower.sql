/*
  # Update smiley icons storage configuration
  
  1. Changes
    - Ensure icons bucket exists and is public
    - Update default icons URLs to use storage paths
    
  2. Security
    - Policies are handled conditionally to avoid conflicts
*/

-- Ensure icons bucket exists and is public
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('icons', 'icons', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
  
  -- Only create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public can read icons'
  ) THEN
    CREATE POLICY "Public can read icons"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'icons');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload icons'
  ) THEN
    CREATE POLICY "Authenticated users can upload icons"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'icons' 
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- Update default icons with storage URLs
UPDATE default_icons
SET url = CASE value
  WHEN 5 THEN '/images/smiley-happy.png'
  WHEN 3 THEN '/images/smiley-neutral.png'
  WHEN 1 THEN '/images/smiley-sad.png'
END
WHERE type = 'smileys';