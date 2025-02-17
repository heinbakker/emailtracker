import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: SupabaseUser | null;
  error: AuthError | null;
}

export const authService = {
  async signUp({ email, password, name }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      return { user: data.user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { user: data.user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }
};