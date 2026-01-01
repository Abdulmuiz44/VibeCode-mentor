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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    // Get project and verify ownership
    const project = await ProjectDatabase.getProject(projectId);
    if (project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get generation progress
    const progress = await ProjectDatabase.getGenerationProgress(projectId);

    return NextResponse.json({
      id: project.id,
      status: project.status,
      currentStep: project.current_step,
      error: project.error_message,
      githubUrl: project.github_url,
      steps: progress.steps.map(s => ({
        id: s.id,
        name: s.step_name,
        status: s.status,
        details: s.details,
      })),
      progress: progress.progress,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
