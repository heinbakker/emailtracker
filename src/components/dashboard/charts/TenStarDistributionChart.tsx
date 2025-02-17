import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rating } from '../../../types/ratings';
import { translations } from '../../../utils/translations';

interface TenStarDistributionChartProps {
  ratings: Rating[];
}

export const TenStarDistributionChart = ({ ratings }: TenStarDistributionChartProps) => {
  const data = Array.from({ length: 10 }, (_, i) => {
    const value = i + 1;
    return {
      value,
      label: `${value} ${value === 1 ? translations.star : translations.stars}`,
      count: ratings.filter(r => r.value === value).length
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="label"
          tick={({ x, y, payload }) => (
            <g transform={`translate(${x},${y})`}>
              <text 
                x={0} 
                y={0} 
                dy={16} 
                textAnchor="middle" 
                fill="#666"
                style={{ fontSize: '12px' }}
              >
                {payload.value}
              </text>
            </g>
          )}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [`${value} responses`, 'Count']}
        />
        <Bar 
          dataKey="count" 
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};