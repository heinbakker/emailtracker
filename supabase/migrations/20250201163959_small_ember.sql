/*
  # Add TopDesk Ticket Tracking

  1. Changes to Ratings Table
    - Add `topdesk_ticket_id` column for storing the unique TopDesk ticket ID
    - Add `topdesk_ticket_number` column for storing the human-readable ticket number
    - Add index for faster ticket lookups

  2. Security
    - Maintain existing RLS policies
*/

-- Add TopDesk ticket tracking columns
ALTER TABLE ratings 
ADD COLUMN IF NOT EXISTS topdesk_ticket_id text,
ADD COLUMN IF NOT EXISTS topdesk_ticket_number text;

-- Add index for ticket lookups
CREATE INDEX IF NOT EXISTS idx_ratings_topdesk_ticket 
ON ratings(topdesk_ticket_id) 
WHERE topdesk_ticket_id IS NOT NULL;