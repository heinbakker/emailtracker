import { supabase } from '../config/supabase';

interface Icon {
  value: number;
  url: string;
}

export const iconService = {
  async getStarIconUrl(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('default_icons')
        .select('url')
        .eq('type', 'ten_stars')
        .eq('value', 0)
        .single();
      
      if (error) throw error;
      if (!data?.url) throw new Error('Star icon not found');
      
      return data.url;
    } catch (error) {
      console.error('Failed to fetch star icon:', error);
      // Return fallback URL for star icon
      return 'https://fymlzuznucklhjckxehs.supabase.co/storage/v1/object/public/icons/stars/star.png';
    }
  },

  async getSmileyIcons(): Promise<Icon[]> {
    try {
      const { data, error } = await supabase
        .from('default_icons')
        .select('value, url')
        .eq('type', 'smileys')
        .order('value');
      
      if (error) throw error;
      if (!data?.length) throw new Error('No smiley icons found');
      
      return data;
    } catch (error) {
      console.error('Failed to fetch smiley icons:', error);
      return [];
    }
  },

  async getCustomIcons(): Promise<Icon[]> {
    try {
      const { data, error } = await supabase
        .from('default_icons')
        .select('value, url')
        .eq('type', 'custom')
        .order('value');
      
      if (error) throw error;
      if (!data?.length) throw new Error('No custom icons found');
      
      return data;
    } catch (error) {
      console.error('Failed to fetch custom icons:', error);
      return [];
    }
  }
};