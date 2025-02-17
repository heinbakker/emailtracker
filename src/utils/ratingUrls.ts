import { RatingType } from '../types/ratings';

export function generateRatingUrls(baseUrl: string, code: string, type: RatingType) {
  const createUrl = (value: number) => {
    const url = new URL(`/rate/${code}`, baseUrl);
    url.searchParams.set('type', type);
    url.searchParams.set('value', value.toString());
    return url.toString();
  };

  switch (type) {
    case 'stars':
      return {
        stars: [1, 2, 3, 4, 5].map(createUrl)
      };
    case 'thumbs':
      return {
        thumbs: [createUrl(0), createUrl(2)] as [string, string]
      };
    case 'smileys':
      return {
        smileys: [createUrl(1), createUrl(3), createUrl(5)] as [string, string, string]
      };
  }
}