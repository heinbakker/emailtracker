/*
  # Add TopDesk Integration

  1. New Tables
    - `topdesk_config`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `enabled` (boolean)
      - `api_url` (text)
      - `api_key` (text, encrypted)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes to Ratings Table
    - Add `topdesk_ticket_number` column
    - Add `topdesk_ticket_id` column

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Create TopDesk configuration table
CREATE TABLE IF NOT EXISTS topdesk_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  enabled boolean DEFAULT false,
  api_url text,
  api_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add TopDesk ticket information to ratings
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS topdesk_ticket_number text;
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS topdesk_ticket_id text;

-- Enable RLS
ALTER TABLE topdesk_config ENABLE ROW LEVEL SECURITY;

-- Create policies for TopDesk config
CREATE POLICY "Users can manage their own TopDesk config"
  ON topdesk_config
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_topdesk_config_updated_at
  BEFORE UPDATE ON topdesk_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();