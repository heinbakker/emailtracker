import React, { useState } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { ChartContainer } from '../components/dashboard/charts/ChartContainer';
import { RatingDistributionChart } from '../components/dashboard/charts/RatingDistributionChart';
import { RatingTimelineChart } from '../components/dashboard/charts/RatingTimelineChart';
import { RatingsList } from '../components/dashboard/RatingsList';
import { TenStarDashboard } from '../components/dashboard/TenStarDashboard';
import { DateRangeFilter, DateRange } from '../components/dashboard/DateRangeFilter';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useRatings } from '../hooks/useRatings';
import { RatingType } from '../types/ratings';
import { translations } from '../utils/translations';
import { getDateRangeStart } from '../utils/date';

export default function Dashboard() {
  const [ratingType, setRatingType] = useState<RatingType>('stars');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const { ratings, isLoading, error } = useRatings();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  const dateStart = getDateRangeStart(dateRange);
  const filteredRatings = ratings.filter(rating => new Date(rating.created_at) >= dateStart);
  const typeRatings = filteredRatings.filter(r => r.type === ratingType);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <DashboardHeader 
          ratingType={ratingType}
          onRatingTypeChange={setRatingType}
        />
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
        />
      </div>
      
      {ratingType === 'ten_stars' ? (
        <TenStarDashboard ratings={typeRatings} />
      ) : (
        <>
          <DashboardStats 
            ratings={typeRatings} 
            ratingType={ratingType} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer title={translations.ratingsOverTime} height={300}>
              <RatingTimelineChart 
                ratings={typeRatings}
                ratingType={ratingType}
              />
            </ChartContainer>

            <ChartContainer title={translations.ratingDistribution} height={300}>
              <RatingDistributionChart 
                ratings={typeRatings}
                ratingType={ratingType}
              />
            </ChartContainer>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">{translations.recentRatings}</h2>
            <RatingsList 
              ratings={typeRatings}
              ratingType={ratingType}
            />
          </div>
        </>
      )}
    </div>
  );
}