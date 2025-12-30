import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { GitHubTokenDatabase } from '@/lib/db/projects';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete GitHub token
    await GitHubTokenDatabase.deleteToken(session.user.id);

    return NextResponse.json(
      { message: 'GitHub disconnected successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect GitHub' },
      { status: 500 }
    );
  }
}
