import { supabase } from '../config/supabase';

export const ratingLinksService = {
  async getUserActiveLink(userId: string) {
    console.log('Getting active rating link for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('rating_links')
        .select('code')
        .eq('user_id', userId)
        .eq('is_active', true)
        .filter('expires_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Failed to fetch rating link:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching rating link:', err);
      return null;
    }
  },

  async getLinkByCode(code: string) {
    console.log('Looking up rating link:', code);
    
    if (!code) {
      throw new Error('Rating code is required');
    }

    try {
      const { data, error } = await supabase
        .from('rating_links')
        .select('user_id')
        .eq('code', code)
        .eq('is_active', true)
        .filter('expires_at', 'is', null)
        .single();

      if (error) {
        console.error('Failed to fetch rating link:', error);
        throw new Error('Invalid or expired rating link');
      }

      if (!data) {
        console.error('No rating link found for code:', code);
        throw new Error('Invalid or expired rating link');
      }

      console.log('Found rating link:', data);
      return data;
    } catch (error) {
      console.error('Rating link lookup failed:', error);
      throw error;
    }
  },

  async createLink(userId: string): Promise<string> {
    console.log('Creating rating link for user:', userId);
    
    try {
      // Generate unique code
      const { data: code, error: codeError } = await supabase
        .rpc('generate_unique_code')
        .single();

      if (codeError || !code) {
        console.error('Failed to generate code:', codeError);
        throw new Error('Failed to create rating link');
      }

      console.log('Successfully generated code:', code);
      return code;
    } catch (error) {
      console.error('Rating link creation failed:', error);
      throw error;
    }
  }
};