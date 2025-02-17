import { DateRange } from '../components/dashboard/DateRangeFilter';

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('nl-NL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getDateRangeStart = (range: DateRange): Date => {
  const now = new Date();
  switch (range) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case '30d':
      return new Date(now.setDate(now.getDate() - 30));
    case '90d':
      return new Date(now.setDate(now.getDate() - 90));
    case '1y':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case 'all':
      return new Date(0); // Beginning of time
    default:
      return new Date(now.setDate(now.getDate() - 30)); // Default to 30 days
  }
};