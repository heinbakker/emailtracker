import React from 'react';
import { Rating } from '../../types/ratings';
import { TenStarStats } from './TenStarStats';
import { TenStarDistributionChart } from './charts/TenStarDistributionChart';
import { RatingTimelineChart } from './charts/RatingTimelineChart';
import { ChartContainer } from './charts/ChartContainer';
import { RatingsList } from './RatingsList';
import { translations } from '../../utils/translations';

interface TenStarDashboardProps {
  ratings: Rating[];
}

export const TenStarDashboard = ({ ratings }: TenStarDashboardProps) => {
  const tenStarRatings = ratings.filter(r => r.type === 'ten_stars');

  return (
    <div className="space-y-8">
      <TenStarStats ratings={tenStarRatings} />
      
      <div className="space-y-8">
        <ChartContainer title={translations.tenStarDistribution} height={300}>
          <TenStarDistributionChart ratings={tenStarRatings} />
        </ChartContainer>
        <ChartContainer title={translations.ratingsOverTime} height={300}>
          <RatingTimelineChart
            ratings={tenStarRatings}
            ratingType="ten_stars"
          />
        </ChartContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">{translations.recentTenStarRatings}</h2>
        <RatingsList 
          ratings={tenStarRatings}
          ratingType="ten_stars"
        />
      </div>
    </div>
  );
};