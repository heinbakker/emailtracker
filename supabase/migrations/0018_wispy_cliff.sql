/*
  # Smiley Rating System Setup

  1. Changes
    - Update ratings table validation for smiley values
    - Add smiley icons configuration
    - Update storage and access policies

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- Update ratings table validation
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS valid_rating_value;
ALTER TABLE ratings ADD CONSTRAINT valid_rating_value CHECK (
  (type = 'stars' AND value BETWEEN 1 AND 5) OR
  (type = 'thumbs' AND value BETWEEN 0 AND 2) OR
  (type = 'smileys' AND value IN (1, 3, 5))
);

-- Drop existing default_icons if exists and recreate
DROP TABLE IF EXISTS default_icons;
CREATE TABLE default_icons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  value integer NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_icon_type CHECK (type IN ('stars', 'thumbs', 'smileys')),
  CONSTRAINT valid_smiley_value CHECK (
    (type = 'smileys' AND value IN (1, 3, 5)) OR
    (type != 'smileys')
  ),
  UNIQUE(type, value)
);

-- Enable RLS
ALTER TABLE default_icons ENABLE ROW LEVEL SECURITY;

-- Create policies for default_icons
CREATE POLICY "default_icons_select_policy"
  ON default_icons FOR SELECT
  TO public
  USING (true);

CREATE POLICY "default_icons_insert_policy"
  ON default_icons FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default smiley icons
INSERT INTO default_icons (type, value, url)
VALUES 
  ('smileys', 5, '/images/smiley-happy.png'),
  ('smileys', 3, '/images/smiley-neutral.png'),
  ('smileys', 1, '/images/smiley-sad.png')
ON CONFLICT (type, value) 
DO UPDATE SET url = EXCLUDED.url;