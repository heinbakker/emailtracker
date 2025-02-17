import { RatingSize } from '../types/ratings';

export const getRatingSizeConfig = (size: RatingSize = 'md') => {
  switch (size) {
    case 'sm':
      return {
        starSize: '20px',
        spacing: '4px'
      };
    case 'md':
      return {
        starSize: '24px',
        spacing: '6px'
      };
    case 'lg':
      return {
        starSize: '32px',
        spacing: '8px'
      };
    case 'xl':
      return {
        starSize: '40px',
        spacing: '10px'
      };
    default: // md
      return {
        starSize: '24px',
        spacing: '6px'
      };
  }
};