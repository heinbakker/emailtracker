import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';

interface Image {
  id: string;
  url: string;
  created_at: string;
}

export function useImages() {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const data = await storageService.getImages();
      setImages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  return { images, isLoading, error, reload: loadImages };
}