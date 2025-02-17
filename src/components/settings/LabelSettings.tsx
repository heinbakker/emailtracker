import React, { useState } from 'react';
import { RatingType } from '../../types/ratings';
import { translations } from '../../utils/translations';

interface LabelSettingsProps {
  type: RatingType;
  onChange: (labels: Record<string, string>) => void;
}

export const LabelSettings = ({ type, onChange }: LabelSettingsProps) => {
  const [labels, setLabels] = useState<Record<string, string>>({});

  const handleLabelChange = (key: string, value: string) => {
    const newLabels = { ...labels, [key]: value };
    setLabels(newLabels);
    onChange(newLabels);
  };

  const renderLabelInputs = () => {
    switch (type) {
      case 'stars':
      case 'ten_stars':
        return (
          <>
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              {translations.starLabels}
            </h3>
            <div className="space-y-3">
              <LabelInput
                label={`1 ${translations.star}`}
                value={labels.poor || ''}
                onChange={(value) => handleLabelChange('poor', value)}
                placeholder={translations.enterStartLabel}
              />
              <LabelInput
                label={`${type === 'stars' ? '5' : '10'} ${translations.stars}`}
                value={labels.excellent || ''}
                onChange={(value) => handleLabelChange('excellent', value)}
                placeholder={translations.enterEndLabel}
              />
            </div>
          </>
        );
      case 'custom':
        return (
          <>
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              {translations.customLabels}
            </h3>
            <div className="space-y-3">
              <LabelInput
                label={translations.negative}
                value={labels.negative || ''}
                onChange={(value) => handleLabelChange('negative', value)}
                placeholder={translations.enterNegativeLabel}
              />
              <LabelInput
                label={translations.neutral}
                value={labels.neutral || ''}
                onChange={(value) => handleLabelChange('neutral', value)}
                placeholder={translations.enterNeutralLabel}
              />
              <LabelInput
                label={translations.positive}
                value={labels.positive || ''}
                onChange={(value) => handleLabelChange('positive', value)}
                placeholder={translations.enterPositiveLabel}
              />
              <LabelInput
                label={translations.excellent}
                value={labels.excellent || ''}
                onChange={(value) => handleLabelChange('excellent', value)}
                placeholder={translations.enterExcellentLabel}
              />
            </div>
          </>
        );
      case 'smileys':
        return (
          <>
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              {translations.smileyLabels}
            </h3>
            <div className="space-y-3">
              <LabelInput
                label={translations.unsatisfied}
                value={labels.unsatisfied || ''}
                onChange={(value) => handleLabelChange('unsatisfied', value)}
                placeholder={translations.enterUnsatisfiedLabel}
              />
              <LabelInput
                label={translations.neutral}
                value={labels.neutral || ''}
                onChange={(value) => handleLabelChange('neutral', value)}
                placeholder={translations.enterNeutralLabel}
              />
              <LabelInput
                label={translations.satisfied}
                value={labels.satisfied || ''}
                onChange={(value) => handleLabelChange('satisfied', value)}
                placeholder={translations.enterSatisfiedLabel}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderLabelInputs()}
    </div>
  );
};

interface LabelInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const LabelInput = ({ label, value, onChange, placeholder }: LabelInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder || label}
    />
  </div>
);