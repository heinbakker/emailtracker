import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { RatingType } from '../types/ratings';
import { ratingsService } from '../services/ratings';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export default function Rate() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError('Missing rating code');
      return;
    }

    const type = searchParams.get('type') as RatingType;
    const valueStr = searchParams.get('value');
    const ticketId = searchParams.get('ticketId');
    const ticketNumber = searchParams.get('ticketNumber');

    if (!type || !valueStr) {
      setError('Invalid rating parameters');
      return;
    }

    const value = parseInt(valueStr, 10);
    if (isNaN(value)) {
      setError('Invalid rating value');
      return;
    }

    const submitRating = async () => {
      try {
        setIsSubmitting(true);
        setError(null);
        await ratingsService.submitRating({ 
          code, 
          type, 
          value,
          topdesk: ticketId ? {
            ticketId,
            ticketNumber: ticketNumber || ''
          } : undefined
        });
        navigate('/thank-you', { replace: true });
      } catch (err) {
        console.error('Rating submission failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to submit rating');
      } finally {
        setIsSubmitting(false);
      }
    };

    submitRating();
  }, [code, searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-red-600">
            <p className="font-medium mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center">
        {isSubmitting ? (
          <>
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Submitting your rating...</p>
          </>
        ) : (
          <p className="text-gray-600">Processing your rating...</p>
        )}
      </div>
    </div>
  );
}