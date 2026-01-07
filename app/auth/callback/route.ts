import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Email verification callback handler
 * Handles the link clicked from confirmation emails
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  // Initialize Supabase client with anon key for client-side auth operations
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
    // Handle OAuth callback (code-based)
    if (code) {
      console.log('[Auth Callback] Processing OAuth code');
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('[Auth Callback] OAuth error:', error);
        return NextResponse.redirect(new URL('/auth?error=invalid_code', requestUrl.origin));
      }
      console.log('[Auth Callback] OAuth session established');
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
    }

    // Handle email verification callback (token_hash-based)
    if (token_hash && type === 'email') {
      console.log('[Auth Callback] Processing email verification with token_hash');
      
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email',
      });

      if (error) {
        console.error('[Auth Callback] Email verification error:', error);
        return NextResponse.redirect(
          new URL(`/auth/email-verified?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }

      console.log('[Auth Callback] Email verified successfully');
      return NextResponse.redirect(new URL('/auth/email-verified?success=true', requestUrl.origin));
    }

    // If no code or token_hash, something went wrong
    console.warn('[Auth Callback] No code or token_hash found in callback URL');
    return NextResponse.redirect(new URL('/auth?error=invalid_callback', requestUrl.origin));
  } catch (error: any) {
    console.error('[Auth Callback] Unexpected error:', error);
    return NextResponse.redirect(
      new URL(
        `/auth/email-verified?error=${encodeURIComponent(error.message || 'Verification failed')}`,
        requestUrl.origin
      )
    );
  }
}
