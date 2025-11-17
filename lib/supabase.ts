import { createClient, SupabaseClient, User, AuthError } from '@supabase/supabase-js';
import { SavedBlueprint } from '@/types/blueprint';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

// Check if Supabase is properly configured
const isConfigured = supabaseUrl && supabaseAnonKey;

if (isConfigured && typeof window !== 'undefined') {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Auth functions
export const signInWithGoogle = async () => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logOut = async () => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Database functions for blueprints
export const saveBlueprintToCloud = async (userId: string, blueprint: SavedBlueprint) => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('blueprints')
      .upsert({
        id: `${userId}_${blueprint.id}`,
        user_id: userId,
        blueprint_id: blueprint.id,
        vibe: blueprint.vibe,
        blueprint: blueprint.blueprint,
        timestamp: blueprint.timestamp,
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving blueprint to cloud:', error);
    return false;
  }
};

export const getBlueprintsFromCloud = async (userId: string): Promise<SavedBlueprint[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('blueprints')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      id: item.blueprint_id,
      vibe: item.vibe,
      blueprint: item.blueprint,
      timestamp: item.timestamp,
    }));
  } catch (error) {
    console.error('Error getting blueprints from cloud:', error);
    return [];
  }
};

export const deleteBlueprintFromCloud = async (userId: string, blueprintId: number) => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('blueprints')
      .delete()
      .eq('id', `${userId}_${blueprintId}`);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting blueprint from cloud:', error);
    return false;
  }
};

// Pro status functions
export const getProStatusFromCloud = async (userId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_pro')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    
    return data?.is_pro || false;
  } catch (error) {
    console.error('Error getting Pro status from cloud:', error);
    return false;
  }
};

export const setProStatusInCloud = async (userId: string, email: string, isPro: boolean) => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        is_pro: isPro,
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error setting Pro status in cloud:', error);
    return false;
  }
};

// Sync local blueprints to cloud
export const syncLocalToCloud = async (userId: string, localBlueprints: SavedBlueprint[]) => {
  if (!supabase) return false;
  try {
    const cloudBlueprints = await getBlueprintsFromCloud(userId);
    const cloudIds = new Set(cloudBlueprints.map(b => b.id));
    
    // Upload local blueprints that don't exist in cloud
    const promises = localBlueprints
      .filter(blueprint => !cloudIds.has(blueprint.id))
      .map(blueprint => saveBlueprintToCloud(userId, blueprint));
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error syncing local to cloud:', error);
    return false;
  }
};

// Custom Prompts for Pro Users
export interface CustomPrompt {
  id: string;
  title: string;
  prompt: string;
  timestamp: number;
}

export const saveCustomPrompt = async (userId: string, prompt: CustomPrompt): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('custom_prompts')
      .upsert({
        id: `${userId}_${prompt.id}`,
        user_id: userId,
        prompt_id: prompt.id,
        title: prompt.title,
        prompt: prompt.prompt,
        timestamp: prompt.timestamp,
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving custom prompt:', error);
    return false;
  }
};

export const getCustomPrompts = async (userId: string): Promise<CustomPrompt[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('custom_prompts')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      id: item.prompt_id,
      title: item.title,
      prompt: item.prompt,
      timestamp: item.timestamp,
    }));
  } catch (error) {
    console.error('Error getting custom prompts:', error);
    return [];
  }
};

export const deleteCustomPrompt = async (userId: string, promptId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('custom_prompts')
      .delete()
      .eq('id', `${userId}_${promptId}`);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting custom prompt:', error);
    return false;
  }
};
