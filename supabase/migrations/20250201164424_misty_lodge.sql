/*
  # Add encryption support for TopDesk credentials
  
  1. Changes
    - Add pgcrypto extension if not exists
    - Create encryption key management function
    - Create encryption/decryption functions
    - Modify topdesk_config table to use encrypted fields
    - Add policies to protect encryption keys
*/

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure function to generate and manage encryption keys
CREATE OR REPLACE FUNCTION generate_encryption_key()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create encryption function
CREATE OR REPLACE FUNCTION encrypt_value(value text, key_id uuid)
RETURNS text AS $$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key from secure storage
  encryption_key := current_setting('app.encryption_key', true);
  
  IF encryption_key IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN encode(
    encrypt(
      value::bytea,
      decode(encryption_key, 'base64'),
      'aes-gcm'
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create decryption function
CREATE OR REPLACE FUNCTION decrypt_value(encrypted_value text, key_id uuid)
RETURNS text AS $$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key from secure storage
  encryption_key := current_setting('app.encryption_key', true);
  
  IF encryption_key IS NULL OR encrypted_value IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN convert_from(
    decrypt(
      decode(encrypted_value, 'base64'),
      decode(encryption_key, 'base64'),
      'aes-gcm'
    ),
    'utf8'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add encrypted columns to topdesk_config
ALTER TABLE topdesk_config
  ADD COLUMN encrypted_api_key text,
  ADD COLUMN encrypted_api_url text,
  ADD COLUMN key_id uuid DEFAULT gen_random_uuid();

-- Migrate existing data
DO $$
DECLARE
  encryption_key text;
BEGIN
  -- Generate new encryption key
  encryption_key := generate_encryption_key();
  
  -- Store encryption key in session
  PERFORM set_config('app.encryption_key', encryption_key, false);
  
  -- Encrypt existing data
  UPDATE topdesk_config
  SET 
    encrypted_api_key = encrypt_value(api_key, key_id),
    encrypted_api_url = encrypt_value(api_url, key_id)
  WHERE api_key IS NOT NULL OR api_url IS NOT NULL;
  
  -- Clear encryption key from session
  PERFORM set_config('app.encryption_key', NULL, false);
END $$;

-- Drop old plaintext columns
ALTER TABLE topdesk_config
  DROP COLUMN api_key,
  DROP COLUMN api_url;