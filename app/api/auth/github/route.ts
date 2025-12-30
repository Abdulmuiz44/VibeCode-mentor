import { NextRequest, NextResponse } from 'next/server';
import { GitHubOAuth } from '@/lib/github/oauth';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

export async function GET(request: NextRequest) {
  try {
    if (!GITHUB_CLIENT_ID) {
      return NextResponse.json(
        { error: 'GitHub OAuth not configured' },
        { status: 500 }
      );
    }

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Store state in cookie
    const response = NextResponse.json({
      authUrl: GitHubOAuth.getAuthorizationUrl(state),
    });

    response.cookies.set('github_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('GitHub auth error:', error);
    return NextResponse.json(
      { error: 'Failed to start GitHub authentication' },
      { status: 500 }
    );
  }
}
