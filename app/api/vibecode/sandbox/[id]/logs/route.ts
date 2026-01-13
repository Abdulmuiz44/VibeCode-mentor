/**
 * Sandbox API - Get Build Logs
 * GET /api/vibecode/sandbox/[id]/logs
 * 
 * Returns the build logs for a sandbox
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { SandboxDatabase, BuildLogDatabase } from '@/lib/sandbox/database';

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
        const sandboxDbId = resolvedParams.id;

        // Get sandbox from DB to verify it exists
        const sandbox = await SandboxDatabase.getById(sandboxDbId);
        if (!sandbox) {
            return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
        }

        // Get logs
        const logs = await BuildLogDatabase.getBySandboxId(sandboxDbId);

        return NextResponse.json({
            sandboxId: sandboxDbId,
            status: sandbox.status,
            logs: logs.map(log => ({
                id: log.id,
                step: log.step,
                level: log.level,
                message: log.message,
                timestamp: log.timestamp,
            })),
        });

    } catch (error) {
        console.error('Get build logs error:', error);
        return NextResponse.json(
            { error: 'Failed to get build logs', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
