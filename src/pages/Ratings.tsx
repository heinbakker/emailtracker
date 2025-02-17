import React, { useState } from 'react';
import { RatingPreview } from '../components/ratings/RatingPreview';
import { RatingType, RatingSize } from '../types/ratings';
import { translations } from '../utils/translations';
import { LabelSettings } from '../components/settings/LabelSettings';
import { generateButtonCode } from '../services/buttonGenerator';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useRatingLink } from '../hooks/useRatingLink';
import { Copy } from 'lucide-react';

const Ratings = () => {
  const [selectedType, setSelectedType] = useState<RatingType>('stars');
  const [selectedSize, setSelectedSize] = useState<RatingSize>('md');
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [previewSize, setPreviewSize] = useState<RatingSize>('md');
  const [buttonCode, setButtonCode] = useState('');
  const { id: userId } = useCurrentUser();
  const { linkCode } = useRatingLink(userId);

  const sizes: { value: RatingSize; label: string }[] = [
    { value: 'sm', label: translations.small },
    { value: 'md', label: translations.medium },
    { value: 'lg', label: translations.large },
    { value: 'xl', label: translations.extraLarge }
  ];

  React.useEffect(() => {
    if (linkCode) {
      generateButtonCode(selectedType, linkCode, selectedSize, labels)
        .then(setButtonCode)
        .catch(console.error);
    }
  }, [linkCode, selectedType, selectedSize, labels]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">{translations.ratings}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">{translations.createRating}</h2>
        
        <div className="space-y-8">
          {/* Rating Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {translations.ratingType}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { type: 'stars' as RatingType, label: translations.starRatings },
                { type: 'ten_stars' as RatingType, label: translations.tenStarRatings },
                { type: 'custom' as RatingType, label: translations.customRatings },
                { type: 'smileys' as RatingType, label: translations.smileyRatings }
              ].map(({ type, label }) => (
                <div
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    selectedType === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{label}</h3>
                  <div className="flex items-center justify-center">
                    <RatingPreview 
                      type={type}
                      interactive={false}
                      selectedValue={type === 'custom' ? 5 : 3}
                      size="md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {translations.size}
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button
                  key={size.value}
                  onClick={() => {
                    setSelectedSize(size.value);
                    setPreviewSize(size.value);
                  }}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    selectedSize === size.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Label Settings */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              {translations.ratingLabels}
            </h3>
            <LabelSettings type={selectedType} onChange={setLabels} />
          </div>

          {/* Rating Preview */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              {translations.preview}
            </h3>
            <div className="space-y-6">
              <div 
                className="flex items-center justify-center p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                dangerouslySetInnerHTML={{ __html: buttonCode }}
              />

              {buttonCode && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {translations.htmlCode}
                    </label>
                    <button
                      onClick={() => navigator.clipboard.writeText(buttonCode)}
                      className="inline-flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {translations.copy}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={buttonCode}
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm p-4"
                    rows={4}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ratings;