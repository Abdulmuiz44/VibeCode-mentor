import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { GitHubOAuth } from '@/lib/github/oauth';
import { GitHubTokenDatabase } from '@/lib/db/github';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/projects?error=${encodeURIComponent(
            `GitHub error: ${error}`
          )}`,
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(
          '/projects?error=Missing authorization code',
          request.url
        )
      );
    }

    // Verify CSRF state
    const storedState = request.cookies.get('github_oauth_state')?.value;
    console.log('OAuth state validation:', {
      receivedState: state,
      storedState: storedState,
      match: storedState === state
    });

    if (!storedState || storedState !== state) {
      console.error('State mismatch! Stored:', storedState, 'Received:', state);
      return NextResponse.redirect(
        new URL(
          '/projects?error=OAuth state validation failed. Please try connecting GitHub again.',
          request.url
        )
      );
    }

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(
        new URL('/auth/login?error=Please log in first', request.url)
      );
    }

    // Exchange code for token
    let tokenData;
    try {
      tokenData = await GitHubOAuth.getAccessToken(code);
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error(`Failed to exchange code for token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Get GitHub user info
    let userInfo;
    try {
      userInfo = await GitHubOAuth.getUserInfo(tokenData.access_token);
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw new Error(`Failed to get GitHub user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Save token to database
    await GitHubTokenDatabase.saveToken(
      session.user.id,
      tokenData.access_token,
      userInfo.login,
      userInfo.id
    );

    // Get project ID if we were in a build flow
    const projectId = request.cookies.get('github_project_id')?.value;

    // Redirect to success page
    let redirectUrl = `/projects?github_connected=true&github_username=${encodeURIComponent(
      userInfo.login
    )}`;

    if (projectId) {
      redirectUrl = `/projects/${projectId}?github_connected=true`;
    }

    const response = NextResponse.redirect(
      new URL(redirectUrl, request.url)
    );

    // Clear the state and project ID cookies
    response.cookies.delete('github_oauth_state');
    response.cookies.delete('github_project_id');

    return response;
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/projects?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'OAuth error'
        )}`,
        request.url
      )
    );
  }
}
