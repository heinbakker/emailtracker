import { RatingType, RATING_CONFIGS } from '../types/ratings';

export const generateButtonCode = (
  ratingType: RatingType,
  buttonColor: string,
  buttonStyle: string,
  userEmail: string
): string => {
  const config = RATING_CONFIGS[ratingType];
  const styles = getButtonStyles(buttonStyle, buttonColor);
  
  return `<a href="https://rating.example.com/rate/${encodeURIComponent(userEmail)}?type=${ratingType}" 
    style="${styles}">
    Rate my response (${config.options.length} ${ratingType})</a>`;
};

const getButtonStyles = (style: string, color: string): string => {
  const baseStyles = 'display:inline-block; text-decoration:none; font-family:sans-serif;';
  
  switch (style) {
    case 'modern':
      return `${baseStyles} padding:8px 16px; background-color:${color}; color:white; border-radius:4px;`;
    case 'minimal':
      return `${baseStyles} padding:6px 12px; color:${color}; border:1px solid ${color}; border-radius:2px;`;
    case 'classic':
      return `${baseStyles} padding:8px 20px; background-color:${color}; color:white;`;
    default:
      return baseStyles;
  }
};