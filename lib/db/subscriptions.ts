import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export type SubscriptionTier = 'free' | 'pro';

export interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at?: string;
  payment_method?: string;
  external_id?: string;
}

export class SubscriptionDatabase {
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  static async getUserTier(userId: string): Promise<SubscriptionTier> {
    try {
      const sub = await this.getUserSubscription(userId);
      return sub?.tier || 'free';
    } catch {
      return 'free';
    }
  }

  static async isPro(userId: string): Promise<boolean> {
    const tier = await this.getUserTier(userId);
    return tier === 'pro';
  }

  static async createFreeSubscription(userId: string): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        tier: 'free',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async upgradeToPro(
    userId: string,
    paymentMethod: string,
    externalId: string
  ): Promise<UserSubscription> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        tier: 'pro',
        status: 'active',
        payment_method: paymentMethod,
        external_id: externalId,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async downgradeToFree(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        tier: 'free',
        status: 'cancelled',
      })
      .eq('user_id', userId);

    if (error) throw error;
  }
}
