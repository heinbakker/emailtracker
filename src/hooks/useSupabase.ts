import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import type { Database } from '../types/supabase';

export function useSupabaseQuery<T>(
  query: () => Promise<{ data: T | null; error: Error | null }>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await query();
        if (error) throw error;
        setData(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, deps);

  return { data, error, isLoading };
}

export function useRatings(userId: string) {
  return useSupabaseQuery<Database['public']['Tables']['ratings']['Row'][]>(
    () => supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    [userId]
  );
}

export function useOrganizationRatings(organizationId: string) {
  return useSupabaseQuery<Database['public']['Tables']['ratings']['Row'][]>(
    () => supabase
      .from('ratings')
      .select('*, users!inner(*)')
      .eq('users.organization_id', organizationId)
      .order('created_at', { ascending: false }),
    [organizationId]
  );
}