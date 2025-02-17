import { Rating, RatingType } from '../types/ratings';

export const calculatePositiveRatingPercentage = (ratings: Rating[], ratingType: RatingType): string => {
  if (ratings.length === 0) return '0%';
  
  const positiveCount = ratings.filter(rating => {
    if (ratingType === 'custom') {
      return rating.value >= 4; // Both positive (4) and excellent (5) count
    } else if (ratingType === 'smileys') {
      return rating.value === 5; // Only happy smiley counts
    } else if (ratingType === 'stars') {
      return rating.value >= 4; // 4 and 5 stars count
    } else if (ratingType === 'ten_stars') {
      return rating.value >= 8; // 8-10 count as positive
    }
    return false;
  }).length;

  return `${Math.round((positiveCount / ratings.length) * 100)}%`;
};

export const groupRatingsByDate = (ratings: Rating[]) => {
  const grouped = ratings.reduce((acc, rating) => {
    const date = rating.created_at.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const groupRatingsByDateAndValue = (ratings: Rating[]) => {
  // First, get all unique dates and values
  const dates = new Set(ratings.map(r => r.created_at.split('T')[0]));
  const values = new Set(ratings.map(r => r.value));

  // Create initial structure with 0 counts
  const grouped = Array.from(dates).map(date => ({
    date,
    ...Object.fromEntries(Array.from(values).map(value => [value, 0]))
  }));

  // Count ratings for each date and value
  ratings.forEach(rating => {
    const date = rating.created_at.split('T')[0];
    const dateEntry = grouped.find(g => g.date === date);
    if (dateEntry) {
      dateEntry[rating.value] = (dateEntry[rating.value] || 0) + 1;
    }
  });

  return grouped.sort((a, b) => a.date.localeCompare(b.date));
};