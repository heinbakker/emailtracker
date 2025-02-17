import { supabase } from '../config/supabase';

export async function checkInviteCode(code: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, invite_code')
    .eq('invite_code', code)
    .maybeSingle();

  if (error) {
    console.error('Error checking invite code:', error);
    console.log('Attempted code:', code);
    return null;
  }

  console.log('Debug - Organization lookup result:', {
    found: !!data,
    inviteCode: data?.invite_code,
    attempted: code
  });

  return data;
}