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

export const savePublicPrompt = async (
  promptId: string,
  userId: string,
  prompt: string,
  blueprintId?: string
): Promise<boolean> => {
  if (!supabaseAdmin) return false;
  try {
    const { error } = await supabaseAdmin
      .from('public_prompts')
      .insert({
        id: promptId,
        user_id: userId,
        prompt,
        blueprint_id: blueprintId,
        created_at: Date.now(),
      });

    if (error) {
      console.error('Error saving public prompt:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in savePublicPrompt:', error);
    return false;
  }
};

export const getPublicPromptById = async (promptId: string) => {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('public_prompts')
      .select('*')
      .eq('id', promptId)
      .single();

    if (error) {
      console.error('Error fetching public prompt:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error in getPublicPromptById:', error);
    return null;
  }
};

// Payment recording and verification
export const recordPayment = async (paymentData: {
  userId: string;
  email: string;
  amount: number;
  currency: string;
  paymentMethod: 'paypal' | 'flutterwave';
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: any;
}): Promise<boolean> => {
  if (!supabaseAdmin) return false;
  try {
    const { error } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: paymentData.userId,
        email: paymentData.email,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_method: paymentData.paymentMethod,
        transaction_id: paymentData.transactionId,
        status: paymentData.status,
        metadata: paymentData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error recording payment:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in recordPayment:', error);
    return false;
  }
};

export const getPaymentByTransactionId = async (transactionId: string) => {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      // Not found is acceptable for new transactions
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching payment:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error in getPaymentByTransactionId:', error);
    return null;
  }
};

export const updatePaymentStatus = async (
  transactionId: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded'
): Promise<boolean> => {
  if (!supabaseAdmin) return false;
  try {
    const { error } = await supabaseAdmin
      .from('payments')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transactionId);

    if (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    return false;
  }
};

const supabaseAdminHelpers = {
  supabaseAdmin,
  setProStatusInCloud,
  saveBlueprintToHistory,
  getProStatusFromCloud,
  savePublicPrompt,
  getPublicPromptById,
  recordPayment,
  getPaymentByTransactionId,
  updatePaymentStatus,
};

export default supabaseAdminHelpers;