import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create Supabase client with timeout configuration
export function createSupabaseClientWithTimeout() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials missing');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'Connection': 'keep-alive',
        'User-Agent': 'VibeCode-Mentor/1.0',
      },
    },
  });
}

// Authentication with retry logic
export async function signInWithRetry(
  email: string, 
  password: string, 
  maxRetries: number = 3
) {
  const supabase = createSupabaseClientWithTimeout();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Auth attempt ${attempt}/${maxRetries} for ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        // If it's a network error, retry
        if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
          if (attempt < maxRetries) {
            console.log(`Retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
        }
        
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from authentication');
      }

      console.log(`✅ Authentication successful on attempt ${attempt}`);
      return data;

    } catch (error) {
      console.error(`Attempt ${attempt} error:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error('Authentication failed after all retries');
}
