import { useState, useEffect } from 'react';
import { ratingLinksService } from '../services/ratingLinks';

export function useRatingLink(userId: string) {
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getLinkCode() {
      try {
        setIsLoading(true);
        setError(null);
        
        // First try to get existing link
        const existingLink = await ratingLinksService.getUserActiveLink(userId);
        
        if (existingLink) {
          setLinkCode(existingLink.code);
          return;
        }

        // Create new link if none exists
        const code = await ratingLinksService.createLink(userId);
        setLinkCode(code);
      } catch (err) {
        console.error('Failed to get rating link:', err);
        setError(err instanceof Error ? err.message : 'Failed to get rating link');
      } finally {
        setIsLoading(false);
      }
    }

    getLinkCode();
  }, [userId]);

  return { linkCode, isLoading, error };
}