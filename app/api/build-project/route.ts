import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { checkProSubscription, requireProResponse } from '@/lib/middleware/pro-check';
import { BuildDatabase } from '@/lib/db/builds';
import { BuildEngine } from '@/lib/code-generator/build-engine';
import { BlueprintV2 } from '@/lib/code-generator/types';

export async function POST(request: NextRequest) {
  try {
    // Check auth & pro subscription
    const check = await checkProSubscription(request);
    const errorResponse = requireProResponse(check.isPro, check.isAuthed);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { blueprintId, blueprint } = body;

    if (!blueprintId || !blueprint) {
      return NextResponse.json(
        { error: 'blueprintId and blueprint are required' },
        { status: 400 }
      );
    }

    const userId = check.userId as string;

    // Create build execution record
    const build = await BuildDatabase.createBuild(
      blueprintId,
      (blueprint as BlueprintV2).version || 1,
      userId
    );

    // Queue the build job (for now, run async without waiting)
    // In production, use Bull/Inngest for proper queuing
    startBuildAsync(build.id, blueprint as BlueprintV2, userId);

    return NextResponse.json({
      buildId: build.id,
      status: 'building',
      estimatedTime: 120,
    });
  } catch (error) {
    console.error('Build project error:', error);
    return NextResponse.json(
      { error: 'Failed to start build' },
      { status: 500 }
    );
  }
}

// Async build execution (without waiting)
function startBuildAsync(buildId: string, blueprint: BlueprintV2, userId: string) {
  (async () => {
    try {
      const engine = new BuildEngine(buildId, blueprint, userId);
      const result = await engine.execute();

      if (!result.success) {
        console.error(`Build failed: ${result.error}`);
      } else {
        console.log(`Build successful: ${result.githubUrl}`);
      }
    } catch (error) {
      console.error('Build execution error:', error);
      await BuildDatabase.updateBuildStatus(buildId, 'failed', {
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })();
}
