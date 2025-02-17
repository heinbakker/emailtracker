import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { Organization } from '../types/auth';
import { generateInviteCode } from '../utils/invite';

export function useOrganization() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrganization = async (name: string): Promise<Organization | null> => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const inviteCode = generateInviteCode();
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name,
          admin_id: user.id,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const validateInviteCode = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('invite_code', code)
        .single();

      if (error) throw error;
      return !!data;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createOrganization,
    validateInviteCode,
    isLoading,
    error
  };
}