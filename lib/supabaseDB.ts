import { supabase } from './supabase';
import { SavedBlueprint, CollaborationComment, CustomPrompt } from '@/types/blueprint';

// Client-side operations using anon key
export const saveBlueprintToCloud = async (userId: string, blueprint: SavedBlueprint) => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('blueprints')
      .insert([{ id: blueprint.id, user_id: userId, vibe: blueprint.vibe, blueprint: blueprint.blueprint, timestamp: blueprint.timestamp }]);
    if (error) {
      console.error('Supabase save error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error saving blueprint to cloud (supabase):', error);
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

    if (error) {
      console.error('Supabase getBlueprints error:', error);
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      vibe: row.vibe,
      blueprint: row.blueprint,
      timestamp: row.timestamp,
    }));
  } catch (error) {
    console.error('Error getting blueprints from supabase:', error);
    return [];
  }
};

export const deleteBlueprintFromCloud = async (userId: string, blueprintId: number) => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('blueprints')
      .delete()
      .match({ id: blueprintId, user_id: userId });

    if (error) {
      console.error('Supabase delete blueprint error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting blueprint from supabase:', error);
    return false;
  }
};

export const syncLocalToCloud = async (userId: string, localBlueprints: SavedBlueprint[]) => {
  if (!supabase) return false;
  try {
    const cloudBlueprints = await getBlueprintsFromCloud(userId);
    const cloudIds = new Set(cloudBlueprints.map((b) => b.id));

    const toInsert = localBlueprints.filter((b) => !cloudIds.has(b.id)).map(b => ({ id: b.id, user_id: userId, vibe: b.vibe, blueprint: b.blueprint, timestamp: b.timestamp }));

    if (toInsert.length === 0) return true;

    const { error } = await supabase.from('blueprints').insert(toInsert);
    if (error) {
      console.error('Supabase sync error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error syncing local to supabase:', error);
    return false;
  }
};

export const getCollaborationComments = async (blueprintId: number): Promise<CollaborationComment[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('blueprint_id', blueprintId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Supabase getCollaborationComments error:', error);
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      blueprintId: row.blueprint_id,
      author: row.author,
      content: row.content,
      timestamp: row.timestamp,
    }));
  } catch (error) {
    console.error('Error fetching collaboration comments:', error);
    return [];
  }
};

export const addCollaborationComment = async (
  blueprintId: number,
  author: string,
  content: string
): Promise<CollaborationComment | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        blueprint_id: blueprintId,
        author,
        content,
        timestamp: Date.now(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase addCollaborationComment error:', error);
      return null;
    }

    return {
      id: data.id,
      blueprintId: data.blueprint_id,
      author: data.author,
      content: data.content,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error('Error adding collaboration comment:', error);
    return null;
  }
};

// Prompts
export const saveCustomPrompt = async (userId: string, prompt: CustomPrompt): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('prompts').insert([{ id: prompt.id, user_id: userId, title: prompt.title, prompt: prompt.prompt, timestamp: prompt.timestamp }]);
    if (error) {
      console.error('Supabase save custom prompt error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error saving custom prompt to supabase:', error);
    return false;
  }
};

export const getCustomPrompts = async (userId: string): Promise<CustomPrompt[]> => {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('prompts').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
    if (error) {
      console.error('Supabase getCustomPrompts error:', error);
      return [];
    }
    return (data as any[]).map((row) => ({ id: row.id, user_id: row.user_id, title: row.title, prompt: row.prompt, timestamp: row.timestamp }));
  } catch (error) {
    console.error('Error fetching custom prompts from supabase:', error);
    return [];
  }
};

export const deleteCustomPrompt = async (userId: string, promptId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('prompts').delete().match({ id: promptId, user_id: userId });
    if (error) {
      console.error('Supabase delete custom prompt error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting custom prompt from supabase:', error);
    return false;
  }
};

// Pro status check using client (fallback)
export const getProStatusFromCloud = async (userId: string): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.from('users').select('is_pro').eq('user_id', userId).single();
    if (error) {
      console.error('Supabase getProStatus error:', error);
      return false;
    }
    return !!data?.is_pro;
  } catch (error) {
    console.error('Error getting pro status from supabase:', error);
    return false;
  }
};

const supabaseClientHelpers = {
  saveBlueprintToCloud,
  getBlueprintsFromCloud,
  deleteBlueprintFromCloud,
  syncLocalToCloud,
  saveCustomPrompt,
  getCustomPrompts,
  deleteCustomPrompt,
  getProStatusFromCloud,
  getCollaborationComments,
  addCollaborationComment,
};

export default supabaseClientHelpers;