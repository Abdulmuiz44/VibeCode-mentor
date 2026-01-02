import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { GitHubTokenDatabase } from '@/lib/db/projects';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', hasToken: false },
        { status: 401 }
      );
    }

    const token = await GitHubTokenDatabase.getToken(session.user.id);
    return NextResponse.json({
      hasToken: !!token,
      username: token?.github_username || null,
    });
  } catch (error) {
    console.error('Token status error:', error);
    return NextResponse.json(
      { error: 'Failed to check token', hasToken: false },
      { status: 500 }
    );
  }
}
