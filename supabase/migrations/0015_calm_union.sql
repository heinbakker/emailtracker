/*
  # Fix storage and icon policies

  1. Storage Policies
    - Allow public read access to icons bucket
    - Allow authenticated users to upload to icons bucket
  
  2. Default Icons
    - Allow authenticated users to insert default icons
    - Keep public read access
*/

-- Storage policies for icons bucket
DO $$
BEGIN
  -- Enable storage if not already enabled
  CREATE EXTENSION IF NOT EXISTS "pg_net";
  
  -- Drop existing policies if any
  DROP POLICY IF EXISTS "Public can read icons" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload icons" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "Public can read icons"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'icons');

  CREATE POLICY "Authenticated users can upload icons"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'icons' 
      AND auth.role() = 'authenticated'
    );
END $$;

-- Default icons policies
DROP POLICY IF EXISTS "Default icons are publicly readable" ON default_icons;
DROP POLICY IF EXISTS "Authenticated users can manage icons" ON default_icons;

-- Allow public read access
CREATE POLICY "Default icons are publicly readable"
  ON default_icons FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Authenticated users can manage icons"
  ON default_icons FOR INSERT
  TO authenticated
  WITH CHECK (true);