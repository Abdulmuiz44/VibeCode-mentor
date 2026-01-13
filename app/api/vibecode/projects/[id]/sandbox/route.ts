/**
 * Project Sandbox API
 * GET /api/vibecode/projects/[id]/sandbox
 * 
 * Returns the active sandbox for a project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { SandboxDatabase } from '@/lib/sandbox/database';
import { SandboxManager } from '@/lib/sandbox';

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

        // Get active sandbox for project
        const sandbox = await SandboxDatabase.getActiveForProject(projectId);

        if (!sandbox) {
            return NextResponse.json({ status: 'none', message: 'No active sandbox found' });
        }

        // Refresh preview URL if needed
        let previewUrl = sandbox.preview_url;
        if (!previewUrl && sandbox.sandbox_id && sandbox.status === 'ready') {
            try {
                const sandboxManager = new SandboxManager();
                previewUrl = await sandboxManager.getPreviewUrl(sandbox.sandbox_id);
                if (previewUrl) {
                    await SandboxDatabase.updatePreviewUrl(sandbox.id, previewUrl);
                }
            } catch (e) {
                console.warn('Failed to refresh preview URL:', e);
            }
        }

        return NextResponse.json({
            id: sandbox.id,
            sandboxId: sandbox.sandbox_id,
            status: sandbox.status,
            previewUrl,
        });

    } catch (error) {
        console.error('Get project sandbox error:', error);
        return NextResponse.json(
            { error: 'Failed to get project sandbox', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
