import { supabase } from '../config/supabase';
import { RatingType } from '../types/ratings';

export interface SubmitRatingParams {
  email: string;
  type: RatingType;
  value: number;
}

export const ratingService = {
  async submitRating({ email, type, value }: SubmitRatingParams) {
    try {
      // Get user ID from email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        throw new Error('Invalid rating link');
      }

      // Submit rating
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          user_id: user.id,
          type,
          value
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to submit rating');
      }

      return data;
    } catch (error) {
      console.error('Rating submission failed:', error);
      throw error;
    }
  }
};