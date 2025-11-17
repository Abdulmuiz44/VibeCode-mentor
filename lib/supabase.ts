import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
const isConfigured = supabaseUrl && supabaseAnonKey;

// Initialize Supabase client
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// User profile type
export interface UserProfile {
  user_id: string;
  email: string;
  name: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

// Store or update user profile in Supabase
export const upsertUserProfile = async (userData: {
  user_id: string;
  email: string;
  name: string | null;
  profile_image: string | null;
}): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    const now = new Date().toISOString();
    
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userData.user_id)
      .single();

    if (existingUser) {
      // User exists, update timestamp only
      const { error: updateError } = await supabase
        .from('users')
        .update({ updated_at: now })
        .eq('user_id', userData.user_id);

      if (updateError) {
        console.error('Error updating user timestamp:', updateError);
        return false;
      }
    } else {
      // New user, insert full profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          user_id: userData.user_id,
          email: userData.email,
          name: userData.name,
          profile_image: userData.profile_image,
          created_at: now,
          updated_at: now,
        });

      if (insertError) {
        console.error('Error inserting user profile:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error upserting user profile:', error);
    return false;
  }
};

// Get user profile from Supabase
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) {
    console.warn('Supabase not configured');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
