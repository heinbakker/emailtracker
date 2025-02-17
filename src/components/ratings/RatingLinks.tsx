import React from 'react';
import { Star, ThumbsUp, ThumbsDown, Smile, Meh, Frown } from 'lucide-react';
import { RatingType } from '../../types/ratings';
import { ratingsService } from '../../services/ratings';

interface RatingLinksProps {
  userEmail: string;
  type: RatingType;
  onRate?: (value: number) => void;
}

export const RatingLinks = ({ userEmail, type, onRate }: RatingLinksProps) => {
  const handleRate = async (value: number) => {
    try {
      await ratingsService.createRating({ type, value });
      onRate?.(value);
    } catch (error) {
      console.error('Rating failed:', error);
    }
  };

  const renderStarRatings = () => (
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <a
          key={value}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleRate(value);
          }}
          className="text-yellow-400 hover:text-yellow-500 transition-colors"
          title={`${value} star${value > 1 ? 's' : ''}`}
        >
          <Star className="w-8 h-8" fill="currentColor" />
        </a>
      ))}
    </div>
  );

  const renderThumbRatings = () => (
    <div className="flex space-x-4">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleRate(0);
        }}
        className="text-red-500 hover:text-red-600 transition-colors"
        title="Thumbs down"
      >
        <ThumbsDown className="w-8 h-8" />
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleRate(2);
        }}
        className="text-green-500 hover:text-green-600 transition-colors"
        title="Thumbs up"
      >
        <ThumbsUp className="w-8 h-8" />
      </a>
    </div>
  );

  const renderSmileyRatings = () => (
    <div className="flex space-x-4">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleRate(1);
        }}
        className="text-red-500 hover:text-red-600 transition-colors"
        title="Unsatisfied"
      >
        <Frown className="w-8 h-8" />
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleRate(3);
        }}
        className="text-gray-500 hover:text-gray-600 transition-colors"
        title="Neutral"
      >
        <Meh className="w-8 h-8" />
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleRate(5);
        }}
        className="text-green-500 hover:text-green-600 transition-colors"
        title="Satisfied"
      >
        <Smile className="w-8 h-8" />
      </a>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Rate this response</h2>
      {type === 'stars' && renderStarRatings()}
      {type === 'thumbs' && renderThumbRatings()}
      {type === 'smileys' && renderSmileyRatings()}
    </div>
  );
};