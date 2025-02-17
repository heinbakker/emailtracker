import React from 'react';
import { translations } from '../../utils/translations';

interface ButtonStyleSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const ButtonStyleSelect = ({ value, onChange }: ButtonStyleSelectProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{translations.buttonStyle}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="modern">{translations.modern}</option>
        <option value="minimal">{translations.minimal}</option>
        <option value="classic">{translations.classic}</option>
      </select>
    </div>
  );
};