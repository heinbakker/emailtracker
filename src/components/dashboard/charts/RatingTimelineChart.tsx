import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Rating, RatingType, RATING_CONFIGS } from '../../../types/ratings';
import { prepareTimelineData } from '../../../utils/chartData';
import { RATING_COLORS } from '../../../constants/colors';
import { translations } from '../../../utils/translations';

const SMILEY_COLORS = {
  5: '#22C55E', // Green for satisfied
  3: '#F97316', // Orange for neutral
  1: '#EF4444'  // Red for unsatisfied
};

interface RatingTimelineChartProps {
  ratings: Rating[];
  ratingType: RatingType;
}

export const RatingTimelineChart = ({ ratings, ratingType }: RatingTimelineChartProps) => {
  const config = RATING_CONFIGS[ratingType];
  
  if (!config) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        {translations.noDataAvailable}
      </div>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        {translations.noDataAvailable}
      </div>
    );
  }

  const data = prepareTimelineData(ratings);
  const colors = ratingType === 'smileys' ? SMILEY_COLORS : RATING_COLORS[ratingType] || RATING_COLORS.custom;

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        {translations.noDataAvailable}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => new Date(date).toLocaleDateString('nl-NL')}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(date) => new Date(date).toLocaleDateString('nl-NL')}
          formatter={(value, name) => {
            const option = config.options.find(opt => opt.value.toString() === name);
            return [`${value} reacties`, option?.label || name];
          }}
        />
        <Legend />
        {config.options.map((option, index) => (
          <Line
            key={option.value}
            type="monotone"
            dataKey={option.value.toString()}
            name={option.label}
            stroke={ratingType === 'smileys' ? colors[option.value] : colors[index % colors.length]}
            strokeWidth={2}
            dot={{ fill: ratingType === 'smileys' ? colors[option.value] : colors[index % colors.length] }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};