import React from 'react';
import { Star } from 'lucide-react';
import { RatingSize } from '../../../types/ratings';
import { getRatingSizeConfig } from '../../../utils/ratingStyles';
import { translations } from '../../../utils/translations';

interface StarRatingProps {
  selectedValue?: number;
  onSelect?: (value: number) => void;
  interactive?: boolean;
  size?: RatingSize;
}

export const StarRating = ({ 
  selectedValue = 0, 
  onSelect, 
  interactive = false,
  size = 'md'
}: StarRatingProps) => {
  const sizeConfig = getRatingSizeConfig(size);

  return (
    <div className="inline-flex items-center" style={{ gap: sizeConfig.spacing }}>
      {Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        const starClasses = `w-${size === 'sm' ? '6' : size === 'lg' ? '10' : size === 'xl' ? '12' : '8'} h-${size === 'sm' ? '6' : size === 'lg' ? '10' : size === 'xl' ? '12' : '8'} ${
          selectedValue >= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`;
        
        if (interactive) {
          return (
            <button
              key={value}
              onClick={(e) => {
                e.preventDefault();
                onSelect?.(value);
              }}
              className="p-0.5 transition-opacity hover:opacity-80 cursor-pointer"
              aria-label={`${value} ${value === 1 ? translations.star : translations.stars}`}
              title={`${value} ${value === 1 ? translations.star : translations.stars}`}
            >
              <Star className={starClasses} />
            </button>
          );
        }

        return (
          <div
            key={value}
            className="p-0.5"
          >
            <Star className={starClasses} />
          </div>
        );
      })}
    </div>
  );
};