import React, { useState } from 'react';
import { RatingTypeSelect } from '../components/settings/RatingTypeSelect';
import { RatingPreview } from '../components/settings/RatingPreview';
import { ButtonCustomizer } from '../components/settings/ButtonCustomizer';
import { IconUploader } from '../components/settings/IconUploader';
import { RatingType } from '../types/ratings';
import { translations } from '../utils/translations';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useRatingLink } from '../hooks/useRatingLink';

const Settings = () => {
  const [ratingType, setRatingType] = useState<RatingType>('stars');
  const [buttonStyle, setButtonStyle] = useState('modern');
  const [buttonColor, setButtonColor] = useState('#3B82F6');
  const { id: userId } = useCurrentUser();
  const { linkCode, isLoading, error } = useRatingLink(userId);

  if (isLoading) {
    return <div>{translations.loading}</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{translations.settings}</h1>
      
      <div className="space-y-6">
        {/* Rating Type Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{translations.ratingIconsCustomization}</h2>
          
          <div className="space-y-6">
            <RatingTypeSelect
              value={ratingType}
              onChange={setRatingType}
            />

            {linkCode && (
              <RatingPreview
                type={ratingType}
                code={linkCode}
              />
            )}
          </div>
        </div>

        {/* Button Customization */}
        <ButtonCustomizer
          buttonStyle={buttonStyle}
          buttonColor={buttonColor}
          ratingType={ratingType}
          onStyleChange={setButtonStyle}
          onColorChange={setButtonColor}
          onRatingTypeChange={setRatingType}
        />

        {/* Icon Upload */}
        <IconUploader />
      </div>
    </div>
  );
};

export default Settings;