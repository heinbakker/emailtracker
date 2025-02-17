import { useState, useEffect } from 'react';
import { ratingsService } from '../services/ratings';
import type { Rating } from '../types/ratings';

export function useRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      setIsLoading(true);
      const data = await ratingsService.getRatings();
      setRatings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ratings');
    } finally {
      setIsLoading(false);
    }
  };

  return { ratings, isLoading, error, reload: loadRatings };
}