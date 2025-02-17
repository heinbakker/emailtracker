import { Rating, RatingType, RATING_CONFIGS } from '../types/ratings';

export const prepareDistributionData = (ratings: Rating[], ratingType: RatingType) => {
  const config = RATING_CONFIGS[ratingType];
  if (!config) {
    console.error(`No configuration found for rating type: ${ratingType}`);
    return [];
  }

  const counts = new Map(config.options.map(opt => [opt.value, 0]));
  
  ratings.forEach(rating => {
    if (rating.type === ratingType) {
      counts.set(rating.value, (counts.get(rating.value) || 0) + 1);
    }
  });

  return Array.from(counts.entries()).map(([value, count]) => ({
    label: config.options.find(opt => opt.value === value)?.label || value.toString(),
    count,
    value
  }));
};

export const prepareTimelineData = (ratings: Rating[]) => {
  if (!ratings || ratings.length === 0) {
    return [];
  }

  const dateGroups = new Map<string, Map<number, number>>();
  
  ratings.forEach(rating => {
    if (!rating.created_at) return;

    const date = new Date(rating.created_at).toISOString().split('T')[0];
    if (!dateGroups.has(date)) {
      dateGroups.set(date, new Map());
    }
    const valueMap = dateGroups.get(date)!;
    valueMap.set(rating.value, (valueMap.get(rating.value) || 0) + 1);
  });

  return Array.from(dateGroups.entries())
    .map(([date, values]) => ({
      date,
      ...Object.fromEntries(Array.from(values.entries())),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};