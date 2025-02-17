import React from 'react';
import { ThumbsUp, Users } from 'lucide-react';
import { StatCard } from './StatCard';
import { Rating, RatingType } from '../../types/ratings';
import { calculatePositiveRatingPercentage } from '../../utils/rating';
import { translations } from '../../utils/translations';

interface DashboardStatsProps {
  ratings: Rating[];
  ratingType: RatingType;
}

export const DashboardStats = ({ ratings, ratingType }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard
        icon={<ThumbsUp className="w-5 h-5 text-green-500" />}
        title={translations.positiveRatings}
        value={calculatePositiveRatingPercentage(ratings, ratingType)}
      />
      <StatCard
        icon={<Users className="w-5 h-5 text-blue-500" />}
        title={translations.totalResponses}
        value={ratings.length.toString()}
      />
    </div>
  );
};