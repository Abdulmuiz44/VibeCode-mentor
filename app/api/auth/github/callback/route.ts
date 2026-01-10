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
    const tokenData = await GitHubOAuth.getAccessToken(code);

    // Get GitHub user info
    const userInfo = await GitHubOAuth.getUserInfo(tokenData.access_token);

    // Save token to database
    await GitHubTokenDatabase.saveToken(
      session.user.id,
      tokenData.access_token,
      userInfo.login,
      userInfo.id
    );

    // Redirect to success page
    const response = NextResponse.redirect(
      new URL(
        `/projects?github_connected=true&github_username=${encodeURIComponent(
          userInfo.login
        )}`,
        request.url
      )
    );

    // Clear the state cookie
    response.cookies.delete('github_oauth_state');

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
