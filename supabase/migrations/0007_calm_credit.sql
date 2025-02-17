/*
  # Add image storage support
  
  1. New Tables
    - `images`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `url` (text, Supabase storage URL)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on `images` table
    - Add policies for authenticated users
*/

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own images" ON images
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organization admins can read org images" ON images
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = images.user_id
      AND o.admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload own images" ON images
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());