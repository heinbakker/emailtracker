export type RatingType = 'stars' | 'custom' | 'smileys' | 'ten_stars';

export type RatingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface RatingSizeConfig {
  starSize: string;
  spacing: string;
  fontSize: string;
}

export interface RatingConfig {
  type: RatingType;
  options: RatingOption[];
}

export interface RatingOption {
  value: number;
  label: string;
  icon?: string;
}

export interface Rating {
  id: string;
  type: RatingType;
  value: number;
  created_at: string;
  feedback?: string;
}

export const RATING_CONFIGS: Record<RatingType, RatingConfig> = {
  stars: {
    type: 'stars',
    options: [
      { value: 1, label: '1 ster' },
      { value: 2, label: '2 sterren' },
      { value: 3, label: '3 sterren' },
      { value: 4, label: '4 sterren' },
      { value: 5, label: '5 sterren' }
    ]
  },
  custom: {
    type: 'custom',
    options: [
      { value: 1, label: 'Negatief' },
      { value: 3, label: 'Neutraal' },
      { value: 4, label: 'Positief' },
      { value: 5, label: 'Uitstekend' }
    ]
  },
  smileys: {
    type: 'smileys',
    options: [
      { value: 1, label: 'Zeer ontevreden' },
      { value: 3, label: 'Neutraal' },
      { value: 5, label: 'Zeer tevreden' }
    ]
  },
  ten_stars: {
    type: 'ten_stars',
    options: Array.from({ length: 10 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1} ${i === 0 ? 'ster' : 'sterren'}`
    }))
  }
};