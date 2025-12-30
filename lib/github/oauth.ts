import { NextRequest, NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

export class GitHubOAuth {
  /**
   * Generate GitHub OAuth authorization URL
   */
  static getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID || '',
      redirect_uri: GITHUB_REDIRECT_URI || '',
      scope: 'repo,user',
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async getAccessToken(code: string): Promise<{
    access_token: string;
    scope: string;
    token_type: string;
  }> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get GitHub access token');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    return data;
  }

  /**
   * Get GitHub user info
   */
  static async getUserInfo(accessToken: string): Promise<{
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
  }> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get GitHub user info');
    }

    return response.json();
  }
}

/**
 * Route handler for GitHub OAuth callback
 * Mount at: /api/auth/github/callback
 */
export async function handleGitHubCallback(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json(
        { error: `GitHub error: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    // Verify state token (CSRF protection)
    // TODO: Implement state verification with your session store

    // Exchange code for access token
    const tokenData = await GitHubOAuth.getAccessToken(code);

    // Get user info
    const userInfo = await GitHubOAuth.getUserInfo(tokenData.access_token);

    // TODO: Save token to database (GitHubTokenDatabase.saveToken)
    // TODO: Create/update user session

    // Redirect to success page with token
    const redirectUrl = new URL('/dashboard/connected-accounts', request.url);
    redirectUrl.searchParams.set('github_connected', 'true');
    redirectUrl.searchParams.set('github_username', userInfo.login);

    const response = NextResponse.redirect(redirectUrl);

    // Store token in secure httpOnly cookie
    response.cookies.set('github_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/auth/error?message=${encodeURIComponent(
          error instanceof Error ? error.message : 'OAuth error'
        )}`,
        request.url
      )
    );
  }
}
