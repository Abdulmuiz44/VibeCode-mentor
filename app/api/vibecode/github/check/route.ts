import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { GitHubTokenDatabase } from '@/lib/db/github';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const hasToken = await GitHubTokenDatabase.hasToken(session.user.id);

        return NextResponse.json({ connected: hasToken });
    } catch (error) {
        console.error('Check GitHub error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
