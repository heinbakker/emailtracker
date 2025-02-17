import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { RatingType, RatingSize } from '../../types/ratings';
import { generateButtonCode } from '../../services/buttonGenerator';
import { translations } from '../../utils/translations';
import { LabelSettings } from './LabelSettings';

interface RatingPreviewProps {
  type: RatingType;
  code: string;
}

export const RatingPreview = ({ type, code }: RatingPreviewProps) => {
  const [buttonCode, setButtonCode] = React.useState('');
  const [selectedSize, setSelectedSize] = React.useState<RatingSize>('md');
  const [labels, setLabels] = useState<Record<string, string>>({});

  const sizes: { value: RatingSize; label: string }[] = [
    { value: 'sm', label: translations.small },
    { value: 'md', label: translations.medium },
    { value: 'lg', label: translations.large },
    { value: 'xl', label: translations.extraLarge }
  ];

  React.useEffect(() => {
    generateButtonCode(type, code, selectedSize, labels)
      .then(setButtonCode)
      .catch(console.error);
  }, [type, code, selectedSize, labels]);

  if (!buttonCode) {
    return <div>{translations.loading}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.size}
        </label>
        <div className="flex gap-2">
          {sizes.map(size => (
            <button
              key={size.value}
              onClick={() => setSelectedSize(size.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
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

      <LabelSettings type={type} onChange={setLabels} />

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">{translations.preview}</h3>
        <div dangerouslySetInnerHTML={{ __html: buttonCode }} />
      </div>

      <div>
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
    </div>
  );
};