import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from './env';

// Load environment configuration
const env = loadEnvConfig();

if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration. Please check your environment variables:\n' +
    '1. Create a .env file in the project root\n' +
    '2. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
    '3. Restart the development server'
  );
}

export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);