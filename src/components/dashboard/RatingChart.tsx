import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rating, RatingType, RATING_CONFIGS } from '../../types/ratings';
import { RatingPreview } from '../ratings/RatingPreview';

interface RatingChartProps {
  ratings: Rating[];
  ratingType: RatingType;
}

export const RatingChart = ({ ratings, ratingType }: RatingChartProps) => {
  const prepareChartData = () => {
    const config = RATING_CONFIGS[ratingType];
    const counts = new Map(config.options.map(opt => [opt.value, 0]));
    
    ratings.forEach(rating => {
      counts.set(rating.value, (counts.get(rating.value) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([value, count]) => ({
      label: config.options.find(opt => opt.value === value)?.label || value.toString(),
      count,
      value
    }));
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={prepareChartData()}>
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
        <Tooltip />
        <Bar dataKey="count" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  );
};