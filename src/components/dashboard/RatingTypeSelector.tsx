import React from 'react';
import { Star, ThumbsUp, Smile } from 'lucide-react';
import { RatingType } from '../../types/ratings';
import { RatingPreview } from '../ratings/RatingPreview';
import { translations } from '../../utils/translations';

interface RatingTypeSelectorProps {
  value: RatingType;
  onChange: (type: RatingType) => void;
}

export const RatingTypeSelector = ({ value, onChange }: RatingTypeSelectorProps) => {
  const ratingTypes = [
    { type: 'stars' as RatingType, label: translations.starRatings, icon: <Star className="w-5 h-5" /> },
    { type: 'thumbs' as RatingType, label: translations.thumbsRatings, icon: <ThumbsUp className="w-5 h-5" /> },
    { type: 'smileys' as RatingType, label: translations.smileyRatings, icon: <Smile className="w-5 h-5" /> },
  ];

  return (
    <div className="flex gap-2">
      {ratingTypes.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            value === type
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
          }`}
          aria-label={label}
        >
          {icon}
          <span className="hidden md:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};