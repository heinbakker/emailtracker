import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please check your environment variables:\n' +
    '1. Ensure .env file exists in project root\n' +
    '2. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set\n' +
    '3. Restart the development server'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);