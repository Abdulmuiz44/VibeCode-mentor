import { NextRequest, NextResponse } from 'next/server';
import { GitHubOAuth } from '@/lib/github/oauth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(7);

    // Store state and projectId in session storage via cookie
    const response = NextResponse.redirect(
      GitHubOAuth.getAuthorizationUrl(state),
      { status: 307 }
    );

    // Set cookies for state and projectId
    response.cookies.set('github_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    if (projectId) {
      response.cookies.set('github_project_id', projectId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
      });
    }

    return response;
  } catch (error) {
    console.error('GitHub authorize error:', error);
    return NextResponse.json(
      { error: 'Failed to authorize GitHub' },
      { status: 500 }
    );
  }
}
