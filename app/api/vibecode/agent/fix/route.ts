
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { FixAgent } from '@/lib/agents/fix-agent';
import { ProjectDatabase } from '@/lib/db/projects';
import { SandboxDatabase } from '@/lib/sandbox/database';
import { SandboxManager } from '@/lib/sandbox';
import { GeneratedFile } from '@/lib/code-generator/types';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { projectId, errorLog, buildId } = await request.json();

        if (!projectId || !errorLog) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Initialize Fix Agent
        const fixAgent = new FixAgent();

        // Analyze and generate fix
        const result = await fixAgent.analyzeAndFix(projectId, errorLog);

        if (!result.success || !result.fixedFile) {
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to generate fix'
            });
        }

        const { fixedFile, explanation } = result;

        // Apply fix to Database
        const project = await ProjectDatabase.getProject(projectId);
        if (project && project.generated_files) {
            const files = project.generated_files.files as GeneratedFile[];
            const fileIndex = files.findIndex(f => f.path === fixedFile.path);

            if (fileIndex >= 0) {
                // Update existing file
                files[fileIndex].content = fixedFile.content;
            } else {
                // Create new file (unlikely for a fix, but possible)
                files.push({
                    path: fixedFile.path,
                    content: fixedFile.content,
                    language: 'typescript' // Default/assumption
                });
            }

            await ProjectDatabase.updateGeneratedFiles(projectId, files);
        }

        // Apply fix to Active Sandbox (if any)
        const activeSandbox = await SandboxDatabase.getActiveForProject(projectId);
        if (activeSandbox && activeSandbox.status === 'running' && activeSandbox.sandbox_id) {
            try {
                const sandboxManager = new SandboxManager();
                await sandboxManager.writeFiles(activeSandbox.sandbox_id, [fixedFile]);
                console.log(`[FixAgent] Applied fix to sandbox ${activeSandbox.sandbox_id}`);
            } catch (e) {
                console.warn(`[FixAgent] Failed to apply fix to sandbox: ${e}`);
                // Non-critical: we updated DB, so next build will pick it up
            }
        }

        return NextResponse.json({
            success: true,
            fixedFile,
            explanation
        });

    } catch (error) {
        console.error('Fix Agent Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
