
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ProjectDatabase } from '@/lib/db/projects';

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

        const versions = await ProjectDatabase.getProjectVersions(projectId);

        return NextResponse.json(versions);
    } catch (error) {
        console.error('Fetch versions error:', error);
        return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
    }
}

export async function POST(
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
        const body = await request.json();
        const { versionId } = body;

        if (!versionId) {
            return NextResponse.json({ error: 'Version ID is required' }, { status: 400 });
        }

        await ProjectDatabase.restoreVersion(projectId, versionId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Restore version error:', error);
        return NextResponse.json({ error: 'Failed to restore version' }, { status: 500 });
    }
}
