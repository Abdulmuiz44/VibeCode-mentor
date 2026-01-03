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

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Handle OAuth callback (code-based)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(new URL('/auth?error=invalid_code', requestUrl.origin));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/auth?error=exchange_failed', requestUrl.origin));
    }
  }

  // Handle email verification callback (token_hash-based)
  if (token_hash && type === 'email') {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email',
      });

      if (error) {
        return NextResponse.redirect(
          new URL(`/auth/email-verification?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }
    } catch (error: any) {
      return NextResponse.redirect(
        new URL(
          `/auth/email-verification?error=${encodeURIComponent(error.message || 'Verification failed')}`,
          requestUrl.origin
        )
      );
    }
  }

  // Redirect to dashboard on success
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
