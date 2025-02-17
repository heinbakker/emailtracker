import { supabase } from '../config/supabase';

interface UploadResult {
  url: string;
  path: string;
}

export const storageService = {
  async getPublicUrl(path: string): Promise<string> {
    const { data: { publicUrl } } = supabase.storage
      .from('icons')
      .getPublicUrl(path);
    return publicUrl;
  }
};