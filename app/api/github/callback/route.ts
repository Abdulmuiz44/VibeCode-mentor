import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { GitHubTokenDatabase } from '@/lib/db/github';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData.error_description);
      return NextResponse.json(
        { error: 'Failed to authenticate with GitHub' },
        { status: 401 }
      );
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'VibeCode-Mentor',
      },
    });

    const githubUser = await userResponse.json();

    if (!githubUser.login || !githubUser.id) {
      console.error('GitHub user error:', githubUser);
      return NextResponse.json(
        { error: 'Failed to get GitHub user info' },
        { status: 400 }
      );
    }

    // Save token to database
    await GitHubTokenDatabase.saveToken(
      session.user.id,
      tokenData.access_token,
      githubUser.login,
      githubUser.id,
      tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : undefined,
      tokenData.refresh_token
    );

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      new URL('/dashboard?github=connected', request.url)
    );
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
