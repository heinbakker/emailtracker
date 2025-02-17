import React, { useState, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { translations } from '../../utils/translations';
import { useClickOutside } from '../../hooks/useClickOutside';

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useClickOutside(dropdownRef, () => setIsOpen(false));

  const ranges: { value: DateRange; label: string }[] = [
    { value: '7d', label: translations.lastWeek },
    { value: '30d', label: translations.lastMonth },
    { value: '90d', label: translations.last90Days },
    { value: '1y', label: translations.lastYear },
    { value: 'all', label: translations.allTime },
  ];

  const selectedRange = ranges.find(range => range.value === value);

  const handleSelect = (range: DateRange) => {
    onChange(range);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">{selectedRange?.label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {ranges.map((range) => (
              <button
                key={range.value}
                onClick={() => handleSelect(range.value)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  value === range.value
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};