import React from 'react';
import { RatingType } from '../../types/ratings';
import { RatingPreview } from '../ratings/RatingPreview';
import { translations } from '../../utils/translations';

interface RatingTypeSelectProps {
  value: RatingType;
  onChange: (value: RatingType) => void;
}

export const RatingTypeSelect = ({ value, onChange }: RatingTypeSelectProps) => {
  const ratingTypes: { value: RatingType; label: string }[] = [
    { value: 'stars', label: translations.starRatings },
    { value: 'ten_stars', label: translations.tenStarRatings },
    { value: 'custom', label: translations.customRatings },
    { value: 'smileys', label: translations.smileyRatings },
  ];

  // Split into two rows
  const firstRow = ratingTypes.slice(0, 2);
  const secondRow = ratingTypes.slice(2);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Rating Type</label>
      <div className="space-y-4">
        {/* First row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {firstRow.map((type) => (
            <RatingTypeCard
              key={type.value}
              type={type}
              isSelected={value === type.value}
              onChange={onChange}
            />
          ))}
        </div>
        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secondRow.map((type) => (
            <RatingTypeCard
              key={type.value}
              type={type}
              isSelected={value === type.value}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface RatingTypeCardProps {
  type: { value: RatingType; label: string };
  isSelected: boolean;
  onChange: (value: RatingType) => void;
}

const RatingTypeCard = ({ type, isSelected, onChange }: RatingTypeCardProps) => (
  <div
    onClick={() => onChange(type.value)}
    className={`cursor-pointer rounded-lg border-2 transition-colors ${
      isSelected
        ? 'border-blue-500 bg-blue-50'
        : 'border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2">{type.label}</h3>
      <RatingPreview 
        type={type.value} 
        selectedValue={type.value === 'custom' ? 5 : 0}
      />
    </div>
  </div>
);