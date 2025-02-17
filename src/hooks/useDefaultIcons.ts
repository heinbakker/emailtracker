import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { translations } from '../utils/translations';

interface DefaultIcon {
  value: number;
  url: string;
}

const FALLBACK_ICONS = {
  smileys: [
    { value: 1, url: '/images/smiley-sad.png' },
    { value: 3, url: '/images/smiley-neutral.png' },
    { value: 5, url: '/images/smiley-happy.png' }
  ]
};

export function useDefaultIcons(type: string) {
  const [icons, setIcons] = useState<DefaultIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadIcons() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('default_icons')
          .select('value, url')
          .eq('type', type)
          .order('value');

        if (fetchError) throw fetchError;
        
        // If no icons found in database, use fallbacks for smileys
        if ((!data || data.length === 0) && type === 'smileys') {
          setIcons(FALLBACK_ICONS.smileys);
          return;
        }

        if (!data || data.length === 0) {
          throw new Error(translations.noIconsAvailable);
        }

        setIcons(data);
      } catch (err) {
        console.error('Failed to load icons:', err);
        // For smileys, use fallback icons even on error
        if (type === 'smileys') {
          setIcons(FALLBACK_ICONS.smileys);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : translations.failedToLoadIcons);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadIcons();
  }, [type]);

  return { icons, isLoading, error };
}