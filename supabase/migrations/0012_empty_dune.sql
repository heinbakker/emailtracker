/*
  # Add default smiley icons
  
  1. New Table
    - `default_icons`
      - `id` (uuid, primary key)
      - `type` (text, rating type)
      - `value` (integer, rating value)
      - `url` (text, image URL)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `default_icons` table
    - Add policy for public read access
*/

-- Create default_icons table
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

-- Allow public read access
CREATE POLICY "Default icons are publicly readable"
  ON default_icons
  FOR SELECT
  TO public
  USING (true);

-- Insert default smiley icons
INSERT INTO default_icons (type, value, url)
VALUES 
  ('smileys', 1, '/images/smiley-sad.png'),
  ('smileys', 3, '/images/smiley-neutral.png'),
  ('smileys', 5, '/images/smiley-happy.png');