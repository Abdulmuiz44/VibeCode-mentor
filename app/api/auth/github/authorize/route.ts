import { NextRequest, NextResponse } from 'next/server';
import { GitHubOAuth } from '@/lib/github/oauth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(7);

    console.log('Setting OAuth state cookie:', state);

    // Get the GitHub authorization URL
    const authUrl = GitHubOAuth.getAuthorizationUrl(state);

    // Create redirect response
    const response = NextResponse.redirect(authUrl, { status: 307 });

    // Set state cookie with explicit path to ensure it's readable by callback
    response.cookies.set('github_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // Explicit path
      maxAge: 600, // 10 minutes
    });

    console.log('State cookie set, redirecting to GitHub');

    if (projectId) {
      response.cookies.set('github_project_id', projectId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 600,
      });
    }

    return response;
  } catch (error) {
    console.error('GitHub authorize error:', error);
    return NextResponse.redirect(
      new URL('/projects?error=Failed to start GitHub authorization', request.url)
    );
  }
}
