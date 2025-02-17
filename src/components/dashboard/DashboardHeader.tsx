import React from 'react';
import { Star, ThumbsUp, Smile } from 'lucide-react';
import { RatingType } from '../../types/ratings';
import { translations } from '../../utils/translations';

interface DashboardHeaderProps {
  ratingType: RatingType;
  onRatingTypeChange: (type: RatingType) => void;
}

export const DashboardHeader = ({ ratingType, onRatingTypeChange }: DashboardHeaderProps) => {
  const ratingTypes = [
    { 
      type: 'custom' as RatingType, 
      label: translations.customRatings,
      icon: <ThumbsUp className="w-5 h-5" /> 
    },
    { 
      type: 'stars' as RatingType, 
      label: translations.starRatings,
      icon: <Star className="w-5 h-5" /> 
    },
    { 
      type: 'ten_stars' as RatingType, 
      label: translations.tenStarRatings,
      icon: <Star className="w-5 h-5" /> 
    },
    { 
      type: 'smileys' as RatingType, 
      label: translations.smileyRatings,
      icon: <Smile className="w-5 h-5" /> 
    }
  ];

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{translations.dashboard}</h1>
      <div className="flex flex-wrap gap-3">
        {ratingTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onRatingTypeChange(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              ratingType === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400 text-gray-700'
            }`}
          >
            {icon}
            <span className="text-sm font-medium whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};