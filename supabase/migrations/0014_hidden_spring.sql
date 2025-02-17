-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Default icons are publicly readable" ON default_icons;

-- Create default_icons table if it doesn't exist
CREATE TABLE IF NOT EXISTS default_icons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  value integer NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_icon_type CHECK (type IN ('stars', 'thumbs', 'smileys'))
);

-- Enable RLS
ALTER TABLE default_icons ENABLE ROW LEVEL SECURITY;

-- Allow public read access to default_icons
CREATE POLICY "Default icons are publicly readable"
  ON default_icons
  FOR SELECT
  TO public
  USING (true);

-- Create storage bucket for icons if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('icons', 'icons', true)
  ON CONFLICT (id) DO UPDATE
  SET public = true;
END $$;