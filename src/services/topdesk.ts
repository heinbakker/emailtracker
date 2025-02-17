import { supabase } from '../config/supabase';
import type { TopDeskConfig } from '../types/topdesk';

const topdeskService = {
  async getConfig(userId: string): Promise<TopDeskConfig | null> {
    const { data, error } = await supabase
      .from('topdesk_config')
      .select()
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch TopDesk config:', error);
      return null;
    }

    // If no config exists yet, return default state
    if (!data) {
      return {
        id: '',
        user_id: userId,
        enabled: false,
        api_url: '',
        api_key: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return data;
  },

  async updateConfig(userId: string, config: Partial<TopDeskConfig>): Promise<TopDeskConfig | null> {
    const { data, error } = await supabase
      .from('topdesk_config')
      .upsert({
        user_id: userId,
        ...config
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to update TopDesk config:', error);
      return null;
    }

    return data;
  },

  async toggleEnabled(userId: string, enabled: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('topdesk_config')
      .upsert({
        user_id: userId,
        enabled
      });

    if (error) {
      console.error('Failed to toggle TopDesk integration:', error);
      return false;
    }

    return true;
  }
};

export { topdeskService };