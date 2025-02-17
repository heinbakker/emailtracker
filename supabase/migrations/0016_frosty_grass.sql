/*
  # Fix RLS policies for icons

  1. Storage Policies
    - Allow public read access to icons bucket
    - Allow authenticated users to upload to icons bucket
    - Add proper bucket policies

  2. Default Icons Table
    - Allow public read access
    - Allow authenticated users to insert/update
    - Fix policy conflicts
*/

-- First, ensure the icons bucket exists and is public
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('icons', 'icons', true)
  ON CONFLICT (id) DO UPDATE
  SET public = true;
END $$;

-- Drop existing storage policies to avoid conflicts
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can read icons" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload icons" ON storage.objects;
  DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
END $$;

-- Create new storage policies
CREATE POLICY "Public can read icons"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'icons');

CREATE POLICY "Authenticated users can upload icons"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'icons' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update own icons"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'icons' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'icons' AND auth.role() = 'authenticated');

-- Drop existing default_icons policies to avoid conflicts
DROP POLICY IF EXISTS "Default icons are publicly readable" ON default_icons;
DROP POLICY IF EXISTS "Authenticated users can manage icons" ON default_icons;

-- Create new default_icons policies
CREATE POLICY "Anyone can read default icons"
  ON default_icons FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert default icons"
  ON default_icons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update default icons"
  ON default_icons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);