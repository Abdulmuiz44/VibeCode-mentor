import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ProjectDatabase } from '@/lib/db/projects';
import { PlannerAgent } from '@/lib/agents/planner';
import { ExecutionAgent } from '@/lib/agents/execution';
import { ModificationAgent } from '@/lib/agents/modification';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { projectId, message } = await req.json();
        const msg = message.toLowerCase();

        // Check project status
        const project = await ProjectDatabase.getProject(projectId);

        // MODIFICATION MODE: If project has generated files (even if not 'completed' or deployed)
        // We allow users to modify the code iteratively
        if (project.generated_files) {
            // Simple keyword heuristic for now, can be upgraded to LLM classifier
            const isChangeRequest = msg.includes('add') || msg.includes('change') || msg.includes('fix') || msg.includes('update') || msg.includes('remove') || msg.includes('make') || msg.includes('modify') || msg.includes('tweak');

            // If it's a change request AND not an approval for the next step (which takes precedence during generation)
            const isApproval = msg.includes('go ahead') || msg.includes('approve') || msg.includes('yes') || msg.includes('next');

            if (isChangeRequest && !isApproval) {
                try {
                    const reply = await ModificationAgent.processRequest(projectId, session.user.id, message);
                    return NextResponse.json({ reply });
                } catch (error: any) {
                    console.error("Modification failed:", error);
                    return NextResponse.json({ reply: `I tried to update your code, but hit a snag: ${error.message}` });
                }
            }
        }

        // Check if this is an approval for a step
        const isApproval = msg.includes('go ahead') || msg.includes('approve') || msg.includes('yes') || msg.includes('next');

        if (isApproval) {
            // EXECUTION MODE: Find next pending step
            const pendingStep = await ProjectDatabase.getPendingStep(projectId);

            if (!pendingStep) {
                return NextResponse.json({
                    reply: "All planned steps are completed! Is there anything else you'd like to add or change?"
                });
            }

            // Execute the step
            await ProjectDatabase.updateStep(pendingStep.id, 'in-progress');
            try {
                // We need to retrieve the original plan node details
                // For now, we'll use a simplified execution or look up in blueprint
                // This is a placeholder for actual node retrieval from storage
                const result = await ExecutionAgent.executeStep({
                    id: pendingStep.id,
                    label: pendingStep.step_name,
                    type: (pendingStep.step_type as any) || 'command',
                    description: pendingStep.step_name,
                    metadata: pendingStep.metadata
                }, projectId);

                await ProjectDatabase.updateStep(pendingStep.id, 'completed', result);

                // Look for the NEXT step to show what's coming
                const nextStep = await ProjectDatabase.getPendingStep(projectId);

                let reply = `Step **${pendingStep.step_name}** completed successfully! ✅\n\n`;
                if (nextStep) {
                    reply += `Next step is **${nextStep.step_name}**. Shall I proceed?`;
                } else {
                    reply += "All tasks in the current plan are finished! What's next?";
                }

                return NextResponse.json({ reply });
            } catch (e: any) {
                await ProjectDatabase.updateStep(pendingStep.id, 'failed', e.message);
                return NextResponse.json({ reply: `Error executing ${pendingStep.step_name}: ${e.message}` });
            }
        } else {
            // PLANNING MODE: Generate new plan
            const plan = await PlannerAgent.generatePlan(message);

            // Clear existing and save new steps
            await ProjectDatabase.clearSteps(projectId);

            for (const node of plan.nodes) {
                await ProjectDatabase.createStep(projectId, node.label);
            }

            // Update Project Status
            await ProjectDatabase.updateProjectStatus(projectId, 'generating');

            return NextResponse.json({
                reply: `I've analyzed your request and created a new plan with ${plan.nodes.length} steps:\n\n` +
                    plan.nodes.map((n: any) => `- **${n.label}**: ${n.description}`).join('\n') +
                    `\n\nShall I proceed with the first step?`,
                plan: plan
            });
        }

    } catch (error) {
        console.error('Agent chat error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
