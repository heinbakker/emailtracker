/*
  # Create ratings table and policies

  1. New Tables
    - `ratings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `type` (enum: stars, thumbs, smileys)
      - `value` (integer)
      - `feedback` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Users can read their own ratings
    - Organization admins can read all ratings from their organization
    - Users can create their own ratings
*/

-- Create enum for rating types
CREATE TYPE rating_type AS ENUM ('stars', 'thumbs', 'smileys');

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  type rating_type NOT NULL,
  value integer NOT NULL,
  feedback text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_rating_value CHECK (
    (type = 'stars' AND value BETWEEN 1 AND 5) OR
    (type = 'thumbs' AND value BETWEEN 0 AND 2) OR
    (type = 'smileys' AND value BETWEEN 1 AND 5)
  )
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own ratings" ON ratings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organization admins can read org ratings" ON ratings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = ratings.user_id
      AND o.admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own ratings" ON ratings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());