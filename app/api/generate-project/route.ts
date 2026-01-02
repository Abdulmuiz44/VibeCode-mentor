import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { CodeGenerator } from '@/lib/code-generator/generator';
import { Blueprint } from '@/lib/code-generator/types';
import { ProjectDatabase, GitHubTokenDatabase } from '@/lib/db/projects';
import { pushProjectToGithub } from '@/lib/github/repository';

interface BlueprintRequest extends Blueprint {
  projectName: string;
  description: string;
  features: string[];
  databaseSchema: string;
  apiEndpoints: string;
  uiComponents: string;
  deploymentRequirements: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const blueprint: BlueprintRequest = await request.json();

    // Validate required fields
    if (!blueprint.projectName || !blueprint.description) {
      return NextResponse.json(
        { error: 'Missing required fields: projectName and description' },
        { status: 400 }
      );
    }

    // Ensure features array exists
    if (!blueprint.features || !Array.isArray(blueprint.features)) {
      blueprint.features = ['auth', 'realtime'];
    }

    // Log the received blueprint for debugging
    console.log('Received blueprint:', {
      projectName: blueprint.projectName,
      description: blueprint.description?.substring(0, 100),
      blueprintContent: blueprint.blueprint?.substring(0, 100),
      features: blueprint.features,
    });

    // Generate project code
    const generator = new CodeGenerator(blueprint);
    const generatedProject = generator.generate();

    // Store in database
    const projectRecord = await ProjectDatabase.createProject(
      session.user.id,
      blueprint,
      generatedProject
    );

    // Create generation steps
    const steps = [
      'Parsing Blueprint',
      'Creating Project Structure',
      'Generating Database Schema',
      'Building API Routes',
      'Creating React Components',
      'Setting Up Authentication',
      'Configuring Environment',
      'Pushing to GitHub',
    ];

    for (const stepName of steps) {
      await ProjectDatabase.createStep(projectRecord.id, stepName);
    }

    // Check if user has GitHub connected
    const hasGithub = await GitHubTokenDatabase.hasToken(session.user.id);

    // Queue async generation job (for production, use Bull/Inngest/etc)
    // For now, start it in background
    generateAndPushProject(
      session.user.id,
      projectRecord.id,
      projectRecord.project_slug,
      blueprint.description,
      generatedProject
    ).catch(err => {
      console.error('Background generation error:', err);
      // Update project status to failed
      ProjectDatabase.updateProjectStatus(
        projectRecord.id,
        'failed',
        undefined,
        err instanceof Error ? err.message : 'Unknown error'
      ).catch(console.error);
    });

    return NextResponse.json(
      {
        projectId: projectRecord.id,
        status: 'generating',
        message: 'Your project is being generated. This may take a few minutes.',
        preview: {
          name: generatedProject.name,
          totalFiles: generatedProject.summary.totalFiles,
          technologies: generatedProject.summary.technologies,
        },
        hasGithub,
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Generate project error:', error);
    return NextResponse.json(
      { error: 'Failed to generate project' },
      { status: 500 }
    );
  }
}

/**
 * Background job to generate and push project to GitHub
 */
async function generateAndPushProject(
  userId: string,
  projectId: string,
  projectSlug: string,
  description: string,
  generatedProject: any
) {
  try {
    // Get GitHub token
    const githubToken = await GitHubTokenDatabase.getToken(userId);
    if (!githubToken) {
      // User doesn't have GitHub connected - just mark as completed without pushing
      await ProjectDatabase.updateProjectStatus(projectId, 'completed', 'Completed (GitHub not connected)');
      return;
    }

    // Update to generating status
    await ProjectDatabase.updateProjectStatus(projectId, 'generating', 'Pushing to GitHub');

    // Push to GitHub
    const result = await pushProjectToGithub(
      githubToken.access_token,
      projectSlug,
      description,
      generatedProject.files
    );

    // Update with GitHub URL
    await ProjectDatabase.updateProjectGithubUrl(projectId, result.repoUrl, result.repoId);

    console.log(`Project ${projectId} successfully pushed to ${result.repoUrl}`);
  } catch (error) {
    console.error(`Failed to generate project ${projectId}:`, error);
    throw error;
  }
}
