/*
  # Create Rating Links Table
  
  1. New Tables
    - `rating_links`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `code` (text, unique identifier for the link)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, optional)
      - `is_active` (boolean)
  
  2. Security
    - Enable RLS
    - Add policies for access control
*/

CREATE TABLE IF NOT EXISTS rating_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Enable RLS
ALTER TABLE rating_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own rating links" ON rating_links
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own rating links" ON rating_links
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create function to generate unique codes
CREATE OR REPLACE FUNCTION generate_unique_code(length integer DEFAULT 8)
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer := 0;
  success boolean := false;
BEGIN
  WHILE NOT success LOOP
    result := '';
    FOR i IN 1..length LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    BEGIN
      INSERT INTO rating_links (user_id, code) VALUES (auth.uid(), result)
      RETURNING code INTO result;
      success := true;
    EXCEPTION WHEN unique_violation THEN
      -- Try again with a new code
    END;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;