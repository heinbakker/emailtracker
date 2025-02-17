import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rating, RatingType, RATING_CONFIGS } from '../../../types/ratings';
import { prepareDistributionData } from '../../../utils/chartData';
import { translations } from '../../../utils/translations';

interface RatingDistributionChartProps {
  ratings: Rating[];
  ratingType: RatingType;
}

export const RatingDistributionChart = ({ ratings, ratingType }: RatingDistributionChartProps) => {
  const config = RATING_CONFIGS[ratingType];
  if (!config) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        {translations.noDataAvailable}
      </div>
    );
  }

  const data = prepareDistributionData(ratings, ratingType);
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        {translations.noDataAvailable}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="label"
          tick={({ x, y, payload }) => (
            <g transform={`translate(${x},${y})`}>
              <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
                {payload.value}
              </text>
            </g>
          )}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [`${value} responses`, 'Count']}
          labelFormatter={(label) => {
            const option = config.options.find(opt => opt.label === label);
            return option ? option.label : label;
          }}
        />
        <Bar dataKey="count" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  );
};