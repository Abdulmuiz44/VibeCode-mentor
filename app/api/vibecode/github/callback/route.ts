import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { GitHubOAuth } from '@/lib/github/oauth';
import { GitHubTokenDatabase } from '@/lib/db/github';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            return NextResponse.redirect(new URL(`/projects?error=github_${error}`, request.url));
        }

        if (!code) {
            return NextResponse.redirect(new URL('/projects?error=missing_code', request.url));
        }

        // Exchange code for access token
        const tokenData = await GitHubOAuth.getAccessToken(code);

        // Get user info
        const userInfo = await GitHubOAuth.getUserInfo(tokenData.access_token);

        // Save token to database
        await GitHubTokenDatabase.saveToken(
            session.user.id,
            tokenData.access_token,
            userInfo.login,
            userInfo.id
        );

        // Redirect back to where they came from (or a success page)
        // For now, redirect to projects
        return NextResponse.redirect(new URL('/projects?github_connected=true', request.url));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('GitHub callback error:', errorMessage, error);
        return NextResponse.redirect(new URL(`/projects?error=${encodeURIComponent(errorMessage)}`, request.url));
    }
}
