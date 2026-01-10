import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ProjectDatabase } from '@/lib/db/projects';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { projectId } = resolvedParams;

        const project = await ProjectDatabase.getProject(projectId);

        // Security check: Ensure user owns the project
        // Note: ProjectDatabase.getProject returns GeneratedProjectRecord which has user_id or owner_id
        if (project.user_id !== session.user.id && project.owner_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch steps as well for the UI
        const steps = await ProjectDatabase.getProjectSteps(projectId);

        return NextResponse.json({ ...project, steps });
    } catch (error) {
        console.error('Fetch project detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { projectId } = resolvedParams;

        // Verify ownership before deleting
        const project = await ProjectDatabase.getProject(projectId);
        if (project.user_id !== session.user.id && project.owner_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await ProjectDatabase.deleteProject(projectId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete project error:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
