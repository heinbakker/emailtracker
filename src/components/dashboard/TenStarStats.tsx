import React from 'react';
import { Rating } from '../../types/ratings';
import { StatCard } from './StatCard';
import { Star, TrendingUp } from 'lucide-react';
import { translations } from '../../utils/translations';

interface TenStarStatsProps {
  ratings: Rating[];
}

export const TenStarStats = ({ ratings }: TenStarStatsProps) => {
  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(1)
    : '0.0';

  const highRatings = ratings.filter(r => r.value >= 8).length;
  const highRatingPercentage = ratings.length > 0
    ? Math.round((highRatings / ratings.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard
        icon={<Star className="w-5 h-5 text-yellow-500" />}
        title={translations.averageRating}
        value={`${averageRating}/10`}
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5 text-green-500" />}
        title={translations.highRatings}
        value={`${highRatingPercentage}%`}
      />
    </div>
  );
};