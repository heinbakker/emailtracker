import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Rating, RatingType, RATING_CONFIGS } from '../../types/ratings';
import { groupRatingsByDateAndValue } from '../../utils/rating';

interface RatingTimelineProps {
  ratings: Rating[];
}

export const RatingTimeline = ({ ratings }: RatingTimelineProps) => {
  const timelineData = groupRatingsByDateAndValue(ratings);
  const ratingType = ratings[0]?.type as RatingType || 'stars';
  const config = RATING_CONFIGS[ratingType];

  const colors = {
    stars: ['#FDE68A', '#FBBF24', '#D97706', '#92400E', '#78350F'],
    thumbs: ['#EF4444', '#9CA3AF', '#22C55E'],
    smileys: ['#EF4444', '#F97316', '#A3A3A3', '#22C55E', '#15803D'],
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => new Date(date).toLocaleDateString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(date) => new Date(date).toLocaleDateString()}
          formatter={(value, name) => [value, config.options.find(opt => opt.value.toString() === name)?.label || name]}
        />
        <Legend />
        {config.options.map((option, index) => (
          <Line
            key={option.value}
            type="monotone"
            dataKey={option.value.toString()}
            name={option.label}
            stroke={colors[ratingType][index]}
            strokeWidth={2}
            dot={{ fill: colors[ratingType][index] }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};