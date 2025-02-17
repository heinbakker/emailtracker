import React from 'react';
import { RatingType } from '../../types/ratings';

interface ButtonPreviewProps {
  type: RatingType;
  color: string;
  style: string;
  iconUrl?: string;
}

export const ButtonPreview = ({ type, color, style, iconUrl }: ButtonPreviewProps) => {
  const getPreviewStyles = () => {
    const baseStyles = 'inline-flex items-center';
    
    switch (style) {
      case 'modern':
        return `${baseStyles} px-4 py-2 rounded-md text-white`;
      case 'minimal':
        return `${baseStyles} px-3 py-1.5 rounded border`;
      case 'classic':
        return `${baseStyles} px-5 py-2 text-white`;
      default:
        return baseStyles;
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-2">Preview:</p>
      <button
        className={getPreviewStyles()}
        style={{
          backgroundColor: style === 'minimal' ? 'transparent' : color,
          borderColor: color,
          color: style === 'minimal' ? color : 'white'
        }}
      >
        {iconUrl && (
          <img 
            src={iconUrl} 
            alt="Rating icon" 
            className="w-4 h-4 mr-2"
          />
        )}
        Rate my response
      </button>
    </div>
  );
};