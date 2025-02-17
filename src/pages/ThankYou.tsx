import React from 'react';
import { CheckCircle } from 'lucide-react';
import { translations } from '../utils/translations';

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {translations.thankYou}
          </h1>
          <p className="text-gray-600">
            {translations.ratingRecorded}
          </p>
        </div>
      </div>
    </div>
  );
}