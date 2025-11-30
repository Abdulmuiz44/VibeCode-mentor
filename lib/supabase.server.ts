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

// Save generated blueprint to history
export const saveBlueprintToHistory = async (
  userId: string,
  projectIdea: string,
  blueprint: string,
  vibe: string = 'default'
): Promise<boolean> => {
  if (!supabaseAdmin) return false;
  try {
    const { error } = await supabaseAdmin
      .from('blueprints')
      .insert({
        user_id: userId,
        project_idea: projectIdea,
        content: blueprint,
        vibe,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving blueprint to history:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in saveBlueprintToHistory:', error);
    return false;
  }
};

export const getProStatusFromCloud = async (userId: string): Promise<boolean> => {
  if (!supabaseAdmin) return false;
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('is_pro')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Supabase admin getProStatus error:', error);
      return false;
    }
    return !!data?.is_pro;
  } catch (error) {
    console.error('Error getting Pro status in supabase admin:', error);
    return false;
  }
};

const supabaseAdminHelpers = {
  supabaseAdmin,
  setProStatusInCloud,
  saveBlueprintToHistory,
  getProStatusFromCloud,
};

export default supabaseAdminHelpers;