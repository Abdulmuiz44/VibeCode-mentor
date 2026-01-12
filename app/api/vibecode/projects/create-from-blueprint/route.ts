import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ProjectDatabase } from '@/lib/db/projects';
import { PlannerAgent } from '@/lib/agents/planner';
import { getProStatusFromCloud } from '@/lib/supabase.server';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check Pro status
        const isPro = await getProStatusFromCloud(session.user.id);
        if (!isPro) {
            return NextResponse.json(
                { error: 'Upgrade to Pro to build full applications' },
                { status: 403 }
            );
        }

        const { projectIdea, blueprint, blueprintId } = await req.json();

        // 1. Create an empty project
        const name = projectIdea.split('\n')[0].substring(0, 50) || 'My Project';
        const project = await ProjectDatabase.createEmptyProject(
            session.user.id,
            name,
            projectIdea
        );

        // Update the existing blueprint if blueprintId is provided
        if (blueprintId) {
            const { supabase } = await import('@/lib/supabase');
            if (supabase) {
                await supabase
                    .from('blueprints')
                    .update({
                        project_id: project.id,
                        user_id: session.user.id
                    })
                    .eq('id', blueprintId);
            }
        } else {
            // If no blueprintId (e.g. from local), we should probably create one
            // to ensure it shows up in history and linked to the project
            const { supabase } = await import('@/lib/supabase');
            if (supabase) {
                await supabase
                    .from('blueprints')
                    .insert({
                        project_id: project.id,
                        user_id: session.user.id,
                        content: blueprint,
                        vibe: projectIdea,
                        created_at: new Date().toISOString()
                    });
            }
        }

        // 2. Generate a plan based on the blueprint
        const planPrompt = `I have a blueprint for a project. Please create a step-by-step implementation plan based on it.\n\nBlueprint:\n${blueprint}`;
        const plan = await PlannerAgent.generatePlan(planPrompt);

        if (!plan || !plan.nodes || !Array.isArray(plan.nodes)) {
            throw new Error('Planner failed to generate a valid implementation plan.');
        }

        // 3. Save the steps
        await ProjectDatabase.clearSteps(project.id);
        for (const node of plan.nodes) {
            await ProjectDatabase.createStep(
                project.id,
                node.label,
                node.type,
                { ...node, blueprint }
            );
        }

        // 4. Update status
        await ProjectDatabase.updateProjectStatus(project.id, 'generating');

        // 5. Trigger the first execution step in the background (fire and forget for scaffolding)
        // We don't await this so the API can return quickly to the user
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/vibecode/agent/execute-next`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: project.id }),
            // Pass authorization info if needed, but the worker usually checks session.
            // In a production background worker, you'd use a service role or a queue.
        }).catch(err => console.error("Background trigger failed:", err));

        return NextResponse.json({
            projectId: project.id,
            message: 'Project created from blueprint successfully.'
        });

    } catch (error: any) {
        console.error('Promotion API error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.stack
        }, { status: 500 });
    }
}
