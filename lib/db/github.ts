import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface GitHubToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at?: string;
  github_username: string;
  github_user_id: number;
  created_at: string;
  updated_at: string;
}

export class GitHubTokenDatabase {
  static async saveToken(
    userId: string,
    accessToken: string,
    githubUsername: string,
    githubUserId: number,
    expiresAt?: string,
    refreshToken?: string
  ): Promise<GitHubToken> {
    const { data, error } = await supabase
      .from('github_tokens')
      .upsert(
        {
          user_id: userId,
          access_token: accessToken,
          refresh_token: refreshToken,
          github_username: githubUsername,
          github_user_id: githubUserId,
          expires_at: expiresAt,
          token_type: 'bearer',
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getToken(userId: string): Promise<GitHubToken | null> {
    const { data, error } = await supabase
      .from('github_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  static async hasToken(userId: string): Promise<boolean> {
    const token = await this.getToken(userId);
    return token !== null;
  }

  static async deleteToken(userId: string): Promise<void> {
    const { error } = await supabase
      .from('github_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async refreshToken(userId: string, newAccessToken: string): Promise<GitHubToken> {
    const existing = await this.getToken(userId);
    if (!existing) throw new Error('Token not found');

    const { data, error } = await supabase
      .from('github_tokens')
      .update({
        access_token: newAccessToken,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTokenCount(): Promise<number> {
    const { count, error } = await supabase
      .from('github_tokens')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
}
