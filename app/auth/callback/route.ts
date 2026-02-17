import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * OAuth callback handler
 * Handles the OAuth code exchange after Google/GitHub login
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    }
  );

  try {
    if (code) {
      console.log('[Auth Callback] Processing OAuth code');
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('[Auth Callback] OAuth error:', error);
        return NextResponse.redirect(new URL('/auth', requestUrl.origin));
      }
      console.log('[Auth Callback] OAuth session established');
      return NextResponse.redirect(new URL('/build', requestUrl.origin));
    }

    // No code found — redirect to auth
    console.warn('[Auth Callback] No code found in callback URL');
    return NextResponse.redirect(new URL('/auth', requestUrl.origin));
  } catch (error: any) {
    console.error('[Auth Callback] Unexpected error:', error);
    return NextResponse.redirect(new URL('/auth', requestUrl.origin));
  }
}
