import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ProjectDatabase } from '@/lib/db/projects';
import { ExecutionAgent } from '@/lib/agents/execution';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { projectId } = await req.json();

        // 1. Find next pending step
        const pendingStep = await ProjectDatabase.getPendingStep(projectId);

        if (!pendingStep) {
            return NextResponse.json({
                message: "No pending steps found.",
                allCompleted: true
            });
        }

        // 2. Mark as in-progress immediately to avoid race conditions
        await ProjectDatabase.updateStep(pendingStep.id, 'in-progress');

        // 3. Execute step
        try {
            const result = await ExecutionAgent.executeStep({
                id: pendingStep.id,
                label: pendingStep.step_name,
                type: (pendingStep.step_type as any) || 'task',
                description: pendingStep.step_name,
                metadata: pendingStep.metadata,
            }, projectId);

            await ProjectDatabase.updateStep(pendingStep.id, 'completed', result);

            // Check if this was the last step
            const remaining = await ProjectDatabase.getPendingStep(projectId);
            if (!remaining) {
                await ProjectDatabase.updateProjectStatus(projectId, 'completed');
            }

            return NextResponse.json({
                success: true,
                completedStep: pendingStep.step_name,
                result
            });
        } catch (e: any) {
            await ProjectDatabase.updateStep(pendingStep.id, 'failed', e.message);
            return NextResponse.json({
                error: `Error executing ${pendingStep.step_name}: ${e.message}`
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Execution API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
