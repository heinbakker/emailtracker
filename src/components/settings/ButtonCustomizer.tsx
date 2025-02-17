import React, { useState } from 'react';
import { RatingType } from '../../types/ratings';
import { generateButtonCode } from '../../services/buttonGenerator';
import { ButtonStyleSelect } from './ButtonStyleSelect';
import { RatingTypeSelect } from './RatingTypeSelect';
import { RatingPreview } from './RatingPreview';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useRatingLink } from '../../hooks/useRatingLink';
import { translations } from '../../utils/translations';

interface ButtonCustomizerProps {
  buttonStyle: string;
  buttonColor: string;
  ratingType: RatingType;
  onStyleChange: (style: string) => void;
  onColorChange: (color: string) => void;
  onRatingTypeChange: (type: RatingType) => void;
}

export const ButtonCustomizer = ({
  buttonStyle,
  buttonColor,
  ratingType,
  onStyleChange,
  onColorChange,
  onRatingTypeChange,
}: ButtonCustomizerProps) => {
  const { id: userId } = useCurrentUser();
  const { linkCode, isLoading: isLinkLoading, error: linkError } = useRatingLink(userId);
  const [buttonCode, setButtonCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (linkCode) {
      generateCode(linkCode);
    }
  }, [linkCode, buttonStyle, buttonColor, ratingType]);

  const generateCode = async (code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedCode = await generateButtonCode(
        ratingType,
        buttonColor,
        buttonStyle,
        code
      );
      setButtonCode(generatedCode);
    } catch (error) {
      console.error('Failed to generate button code:', error);
      setError('Failed to generate rating button. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLinkLoading) {
    return <div>{translations.loading}</div>;
  }

  if (linkError) {
    return <div className="text-red-500">{linkError}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{translations.ratingIconsCustomization}</h2>
      
      <div className="space-y-4">
        <RatingTypeSelect
          value={ratingType}
          onChange={onRatingTypeChange}
        />

        <ButtonStyleSelect
          value={buttonStyle}
          onChange={onStyleChange}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700">{translations.buttonColor}</label>
          <input
            type="color"
            value={buttonColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-gray-500">{translations.generatingPreview}</div>
        ) : (
          <RatingPreview
            type={ratingType}
            code={buttonCode}
          />
        )}
      </div>
    </div>
  );
};