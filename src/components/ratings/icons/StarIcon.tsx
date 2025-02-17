import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabase';

interface StarIconProps {
  className?: string;
}

export const StarIcon = ({ className = '' }: StarIconProps) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStarIcon() {
      const { data } = await supabase
        .from('default_icons')
        .select('url')
        .eq('type', 'ten_stars')
        .eq('value', 0)
        .single();
      
      if (data?.url) {
        setIconUrl(data.url);
      }
    }

    fetchStarIcon();
  }, []);

  if (!iconUrl) return null;

  return (
    <img 
      src={iconUrl}
      alt="Empty star"
      className={`w-5 h-5 ${className}`}
    />
  );
};