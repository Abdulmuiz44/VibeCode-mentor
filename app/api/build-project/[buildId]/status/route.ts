import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { BuildDatabase } from '@/lib/db/builds';

export async function GET(
  request: NextRequest,
  { params }: { params: { buildId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch build execution
    const build = await BuildDatabase.getBuild(params.buildId, session.user.id);
    
    // Fetch build steps
    const steps = await BuildDatabase.getBuildSteps(params.buildId);

    // Calculate progress
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

    // Find current step
    const currentStep = steps.find(s => s.status === 'in-progress')?.step_name || 
                       (steps[0]?.step_name || 'Starting');

    return NextResponse.json({
      buildId: build.id,
      status: build.status,
      progress,
      currentStep,
      steps: steps.map(s => ({
        name: s.step_name,
        status: s.status,
        error: s.error,
      })),
      githubUrl: build.github_url,
      error: build.error_message,
      completedAt: build.completed_at,
    });
  } catch (error) {
    console.error('Build status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch build status' },
      { status: 500 }
    );
  }
}
