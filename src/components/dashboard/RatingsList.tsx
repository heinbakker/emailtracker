import React from 'react';
import { Rating, RatingType } from '../../types/ratings';
import { formatDateTime } from '../../utils/date';
import { RatingPreview } from '../ratings/RatingPreview';

interface RatingsListProps {
  ratings: Rating[];
  ratingType: RatingType;
}

export const RatingsList = ({ ratings, ratingType }: RatingsListProps) => {
  const filteredRatings = ratings
    .filter(rating => rating.type === ratingType)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (filteredRatings.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
        No ratings available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRatings.map((rating) => (
              <tr key={rating.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RatingPreview 
                    type={ratingType} 
                    selectedValue={rating.value}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateTime(rating.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};