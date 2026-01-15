
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { BuildLogDatabase } from '@/lib/sandbox/database';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const projectId = resolvedParams.id;
        const limitParam = request.nextUrl.searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : 200;

        const logs = await BuildLogDatabase.getByProjectId(projectId, limit);

        // Reverse to show oldest first in terminal? 
        // Database query orders by timestamp desc (newest first). 
        // Terminal usually wants oldest first (top -> bottom).
        const sortedLogs = logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        return NextResponse.json(sortedLogs);
    } catch (error) {
        console.error('Fetch logs error:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
