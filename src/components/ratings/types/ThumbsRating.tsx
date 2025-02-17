import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ThumbsRatingProps {
  selectedValue?: number;
  onSelect?: (value: number) => void;
  interactive?: boolean;
}

export const ThumbsRating = ({ selectedValue, onSelect, interactive = false }: ThumbsRatingProps) => (
  <div className="flex space-x-4">
    <button
      onClick={() => interactive && onSelect?.(0)}
      className={`p-2 rounded-full ${interactive ? 'hover:bg-red-50 cursor-pointer' : ''} ${
        selectedValue === 0 ? 'text-red-500 bg-red-50' : 'text-gray-400'
      }`}
    >
      <ThumbsDown className="w-6 h-6" />
    </button>
    <button
      onClick={() => interactive && onSelect?.(1)}
      className={`p-2 rounded-full ${interactive ? 'hover:bg-gray-50 cursor-pointer' : ''} ${
        selectedValue === 1 ? 'text-gray-500 bg-gray-50' : 'text-gray-400'
      }`}
    >
      <ThumbsUp className="w-6 h-6 transform -rotate-90" />
    </button>
    <button
      onClick={() => interactive && onSelect?.(2)}
      className={`p-2 rounded-full ${interactive ? 'hover:bg-green-50 cursor-pointer' : ''} ${
        selectedValue === 2 ? 'text-green-500 bg-green-50' : 'text-gray-400'
      }`}
    >
      <ThumbsUp className="w-6 h-6" />
    </button>
  </div>
);