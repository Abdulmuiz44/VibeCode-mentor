import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

// Server-side admin helpers (needs SUPABASE_SERVICE_ROLE_KEY)
export const setProStatusInCloud = async (userId: string, email: string, isPro: boolean): Promise<boolean> => {
  if (!supabaseAdmin) return false;
  try {
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from('users')
      .upsert(
        { user_id: userId, email, is_pro: isPro, updated_at: now },
        { onConflict: 'user_id' }
      );
    if (error) {
      console.error('Supabase admin setProStatus error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error setting Pro status in supabase admin:', error);
    return false;
  }
};

const supabaseAdminHelpers = {
  supabaseAdmin,
  setProStatusInCloud,
};

export default supabaseAdminHelpers;