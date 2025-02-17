import React from 'react';
import { Star } from 'lucide-react';
import { RatingSize } from '../../../types/ratings';
import { getRatingSizeConfig } from '../../../utils/ratingStyles';
import { translations } from '../../../utils/translations';

interface TenStarRatingProps {
  selectedValue?: number;
  onSelect?: (value: number) => void;
  interactive?: boolean;
  size?: RatingSize;
}

export const TenStarRating = ({ 
  selectedValue = 0, 
  onSelect, 
  interactive = false,
  size = 'md'
}: TenStarRatingProps) => {
  const sizeConfig = getRatingSizeConfig(size);

  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto" style={{ gap: sizeConfig.spacing }}>
      {Array.from({ length: 10 }, (_, index) => {
        const value = index + 1;
        return (
          <button
            key={value}
            onClick={() => interactive && onSelect?.(value)}
            className={`flex-shrink-0 transition-opacity ${
              interactive ? 'cursor-pointer hover:opacity-80' : ''
            }`}
            aria-label={`${value} ${value === 1 ? translations.star : translations.stars}`}
            title={`${value} ${value === 1 ? translations.star : translations.stars}`}
          >
            <Star 
              className={`w-${size === 'sm' ? '4' : size === 'lg' ? '6' : size === 'xl' ? '8' : '5'} h-${size === 'sm' ? '4' : size === 'lg' ? '6' : size === 'xl' ? '8' : '5'} ${
                selectedValue >= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};