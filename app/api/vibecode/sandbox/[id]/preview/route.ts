/**
 * Sandbox API - Get Preview URL
 * GET /api/vibecode/sandbox/[id]/preview
 * 
 * Returns the preview URL for a running sandbox
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { SandboxManager } from '@/lib/sandbox';
import { SandboxDatabase } from '@/lib/sandbox/database';

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

        // Get sandbox from DB
        const sandbox = await SandboxDatabase.getById(sandboxDbId);
        if (!sandbox) {
            return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
        }

        // If we already have a preview URL cached, return it
        if (sandbox.preview_url) {
            return NextResponse.json({
                previewUrl: sandbox.preview_url,
                status: sandbox.status,
                cached: true,
            });
        }

        // Otherwise, try to get it from the sandbox
        if (!sandbox.sandbox_id) {
            return NextResponse.json({
                previewUrl: null,
                status: sandbox.status,
                message: 'Sandbox not initialized'
            });
        }

        const sandboxManager = new SandboxManager();
        const previewUrl = await sandboxManager.getPreviewUrl(sandbox.sandbox_id);

        // Cache the preview URL if we got one
        if (previewUrl) {
            await SandboxDatabase.updatePreviewUrl(sandboxDbId, previewUrl);
        }

        return NextResponse.json({
            previewUrl,
            status: sandbox.status,
            cached: false,
        });

    } catch (error) {
        console.error('Get preview URL error:', error);
        return NextResponse.json(
            { error: 'Failed to get preview URL', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
