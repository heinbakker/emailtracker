import React from 'react';
import { useDefaultIcons } from '../../../hooks/useDefaultIcons';
import { IconImage } from '../../common/IconImage';
import { translations } from '../../../utils/translations';

interface CustomRatingProps {
  selectedValue?: number;
  onSelect?: (value: number) => void;
  interactive?: boolean;
}

export const CustomRating = ({ selectedValue = 0, onSelect, interactive = false }: CustomRatingProps) => {
  const { icons, isLoading, error } = useDefaultIcons('custom');

  if (isLoading) {
    return <div className="text-gray-500">{translations.loading}</div>;
  }

  if (error || icons.length === 0) {
    return <div className="text-red-500">{error || translations.noIconsAvailable}</div>;
  }

  // Define the order: excellent (5), positive (4), neutral (3), negative (1)
  const orderedValues = [5, 4, 3, 1];
  const orderedIcons = orderedValues
    .map(value => icons.find(icon => icon.value === value))
    .filter((icon): icon is typeof icons[0] => icon !== undefined);

  return (
    <div className="inline-flex items-center space-x-4">
      {orderedIcons.map(({ value, url }) => {
        const label = value === 5 ? translations.excellent :
                     value === 4 ? translations.positive :
                     value === 3 ? translations.neutral :
                     translations.negative;

        return (
          <button
            key={`custom-${value}`}
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
              className={`w-8 h-8 ${selectedValue === value ? 'filter drop-shadow-lg' : ''}`}
            />
          </button>
        );
      })}
    </div>
  );
};