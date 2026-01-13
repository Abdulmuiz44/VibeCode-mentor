/**
 * Sandbox API - Create Sandbox
 * POST /api/vibecode/sandbox/create
 * 
 * Creates a new cloud sandbox for a project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { SandboxManager } from '@/lib/sandbox';
import { SandboxDatabase } from '@/lib/sandbox/database';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { projectId } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        // Check if there's already an active sandbox
        const existingSandbox = await SandboxDatabase.getActiveForProject(projectId);
        if (existingSandbox) {
            return NextResponse.json({
                id: existingSandbox.id,
                sandboxId: existingSandbox.sandbox_id,
                previewUrl: existingSandbox.preview_url,
                status: existingSandbox.status,
                message: 'Existing sandbox found',
            });
        }

        // Create new sandbox
        const sandboxManager = new SandboxManager();

        // Create DB record first
        const dbSandbox = await SandboxDatabase.create(projectId, 'e2b');

        // Create actual sandbox
        const sandboxId = await sandboxManager.create(projectId);

        // Update DB with sandbox ID
        await SandboxDatabase.updateSandboxId(dbSandbox.id, sandboxId);

        return NextResponse.json({
            id: dbSandbox.id,
            sandboxId,
            status: 'ready',
            message: 'Sandbox created successfully',
        }, { status: 201 });

    } catch (error) {
        console.error('Create sandbox error:', error);
        return NextResponse.json(
            { error: 'Failed to create sandbox', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
