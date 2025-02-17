import { supabase } from '../config/supabase';

export const iconService = {
  async getDefaultIcons(type: string) {
    const { data, error } = await supabase
      .from('default_icons')
      .select('*')
      .eq('type', type)
      .order('value');

    if (error) {
      console.error('Failed to fetch icons:', error);
      throw error;
    }

    return data;
  }
};