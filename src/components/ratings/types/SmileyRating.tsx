import React from 'react';
import { useDefaultIcons } from '../../../hooks/useDefaultIcons';
import { IconImage } from '../../common/IconImage';
import { translations } from '../../../utils/translations';
import { RatingSize } from '../../../types/ratings';
import { getRatingSizeConfig } from '../../../utils/ratingStyles';

interface SmileyRatingProps {
  selectedValue?: number;
  onSelect?: (value: number) => void;
  interactive?: boolean;
  size?: RatingSize;
}

export const SmileyRating = ({ 
  selectedValue = 0, 
  onSelect, 
  interactive = false,
  size = 'md'
}: SmileyRatingProps) => {
  const { icons, isLoading, error } = useDefaultIcons('smileys');
  const sizeConfig = getRatingSizeConfig(size);

  if (isLoading) {
    return <div className="text-gray-500">{translations.loading}</div>;
  }

  if (error || icons.length === 0) {
    return <div className="text-red-500">{error || translations.noIconsAvailable}</div>;
  }

  // Define the order: positive (5), neutral (3), negative (1)
  const orderedValues = [5, 3, 1];
  const orderedIcons = orderedValues
    .map(value => icons.find(icon => icon.value === value))
    .filter((icon): icon is typeof icons[0] => icon !== undefined);

  return (
    <div className="inline-flex items-center" style={{ gap: sizeConfig.spacing }}>
      {orderedIcons.map(({ value, url }) => {
        const label = value === 5 ? translations.satisfied :
                     value === 3 ? translations.neutral :
                     translations.unsatisfied;

        return (
          <button
            key={`smiley-${value}`}
            onClick={() => interactive && onSelect?.(value)}
            className={`inline-flex items-center justify-center transition-all duration-200 ${
              interactive ? 'cursor-pointer hover:opacity-90' : ''
            } ${selectedValue === value ? 'shadow-xl bg-white/20 rounded-full opacity-100' : 'opacity-40 hover:opacity-60'}`}
            aria-label={label}
            title={label}
          >
            <IconImage
              src={url}
              alt={label}
              className={`w-${size === 'sm' ? '6' : size === 'lg' ? '10' : size === 'xl' ? '12' : '8'} h-${size === 'sm' ? '6' : size === 'lg' ? '10' : size === 'xl' ? '12' : '8'} ${selectedValue === value ? 'filter drop-shadow-lg' : ''}`}
            />
          </button>
        );
      })}
    </div>
  );
};