/**
 * Sandbox API - Execute Command
 * POST /api/vibecode/sandbox/[id]/execute
 * 
 * Executes a command in an existing sandbox
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { SandboxManager } from '@/lib/sandbox';
import { SandboxDatabase, BuildLogDatabase } from '@/lib/sandbox/database';

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
        const sandboxDbId = resolvedParams.id;

        const body = await request.json();
        const { command } = body;

        if (!command) {
            return NextResponse.json({ error: 'Command is required' }, { status: 400 });
        }

        // Get sandbox from DB
        const sandbox = await SandboxDatabase.getById(sandboxDbId);
        if (!sandbox) {
            return NextResponse.json({ error: 'Sandbox not found' }, { status: 404 });
        }

        if (!sandbox.sandbox_id) {
            return NextResponse.json({ error: 'Sandbox not initialized' }, { status: 400 });
        }

        // Execute command
        const sandboxManager = new SandboxManager();
        const result = await sandboxManager.execute(sandbox.sandbox_id, command);

        // Log execution
        await BuildLogDatabase.log(
            sandbox.project_id,
            'Execute',
            `Command: ${command}\nExit Code: ${result.exitCode}`,
            result.success ? 'info' : 'error',
            sandboxDbId
        );

        return NextResponse.json({
            success: result.success,
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
            duration: result.duration,
        });

    } catch (error) {
        console.error('Execute command error:', error);
        return NextResponse.json(
            { error: 'Failed to execute command', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
