import React from 'react';
import { RatingType, RatingSize } from '../../types/ratings';
import { StarRating } from './types/StarRating';
import { TenStarRating } from './types/TenStarRating';
import { CustomRating } from './types/CustomRating';
import { SmileyRating } from './types/SmileyRating';
import { getRatingSizeConfig } from '../../utils/ratingStyles';

interface RatingPreviewProps {
  type: RatingType;
  selectedValue?: number;
  onSelect?: (value: number) => void;
  interactive?: boolean;
  size?: RatingSize;
  labels?: Record<string, string>;
}

export const RatingPreview = ({ 
  type, 
  selectedValue, 
  onSelect, 
  interactive = false,
  size = 'md',
  labels
}: RatingPreviewProps) => {
  const sizeConfig = getRatingSizeConfig(size);

  const getRatingComponent = () => {
    switch (type) {
      case 'stars':
        return (
          <StarRating 
            selectedValue={selectedValue} 
            onSelect={onSelect} 
            interactive={interactive} 
            size={size}
            labels={labels}
          />
        );
      case 'ten_stars':
        return (
          <TenStarRating 
            selectedValue={selectedValue} 
            onSelect={onSelect} 
            interactive={interactive} 
            size={size}
            labels={labels}
          />
        );
      case 'custom':
        return (
          <CustomRating 
            selectedValue={selectedValue} 
            onSelect={onSelect} 
            interactive={interactive} 
            size={size}
            labels={labels}
          />
        );
      case 'smileys':
        return (
          <SmileyRating 
            selectedValue={selectedValue} 
            onSelect={onSelect} 
            interactive={interactive} 
            size={size}
            labels={labels}
          />
        );
    }
  };

  return (
    <div className="flex items-center justify-center">
      {getRatingComponent()}
    </div>
  );
};