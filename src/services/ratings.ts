import { supabase } from '../config/supabase';
import { RatingType } from '../types/ratings';

interface SubmitRatingParams {
  code: string;
  type: RatingType;
  value: number;
  topdesk?: {
    ticketId: string;
    ticketNumber: string;
  };
}

export interface CreateRatingData {
  userId: string;
  type: RatingType;
  value: number;
  feedback?: string;
}

export const ratingsService = {
  async getRatings() {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async submitRating({ code, type, value, topdesk }: SubmitRatingParams) {
    console.log('Submitting rating:', { code, type, value });

    try {
      // Clean and validate the code
      const normalizedCode = code.trim().toUpperCase();
      if (!normalizedCode) {
        throw new Error('Invalid rating code');
      }

      // Get the user ID from the rating link
      const { data: linkData, error: linkError } = await supabase
        .from('rating_links')
        .select('user_id')
        .eq('code', normalizedCode)
        .single();

      if (linkError || !linkData) {
        console.error('Rating link error:', linkError);
        throw new Error('Invalid rating code');
      }

      // Submit the rating
      const { data: rating, error: ratingError } = await supabase
        .from('ratings')
        .insert({
          user_id: linkData.user_id,
          type,
          value,
          topdesk_ticket_id: topdesk?.ticketId,
          topdesk_ticket_number: topdesk?.ticketNumber
        })
        .select()
        .single();

      if (ratingError) {
        console.error('Rating submission error:', ratingError);
        throw new Error('Failed to submit rating');
      }

      return rating;
    } catch (error) {
      console.error('Rating submission error:', error);
      throw error;
    }
  },

  async createRating({ userId, type, value, feedback }: CreateRatingData) {
    console.log('Creating rating:', { userId, type, value, feedback });

    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Verify the user exists first
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('User not found:', userError);
        throw new Error('Invalid user');
      }

      // Create the rating
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          user_id: userId,
          type,
          value,
          feedback
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create rating:', error);
        throw error;
      }

      console.log('Rating created successfully:', data);
      return data;
    } catch (error) {
      console.error('Rating creation failed:', error);
      throw error;
    }
  }
};