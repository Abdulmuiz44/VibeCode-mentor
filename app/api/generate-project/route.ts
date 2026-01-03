import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { CodeGenerator } from '@/lib/code-generator/generator';
import { Blueprint } from '@/lib/code-generator/types';
import { saveBlueprintToHistory } from '@/lib/supabase.server';
import { ProjectDatabase } from '@/lib/db/projects';

interface BlueprintRequest extends Blueprint {
  projectName: string;
  description: string;
  blueprint?: string;
  features: string[];
  databaseSchema: string;
  apiEndpoints: string;
  uiComponents: string;
  deploymentRequirements: string;
  userId?: string;
}

const GENERATION_STEPS = [
  'Parsing Blueprint',
  'Creating Project Structure',
  'Generating Database Schema',
  'Building API Routes',
  'Creating React Components',
  'Setting Up Authentication',
  'Configuring Environment',
  'Pushing to GitHub',
];

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
    const body: BlueprintRequest = await request.json();

    // Validate required fields
    if (!body.projectName || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: projectName and description' },
        { status: 400 }
      );
    }

    // Ensure features array exists
    if (!body.features || !Array.isArray(body.features)) {
      body.features = ['auth', 'realtime'];
    }

    console.log('Starting project generation:', {
      projectName: body.projectName,
      description: body.description?.substring(0, 50),
      hasBlueprint: !!body.blueprint,
      userId: session.user.id,
    });

    try {
      // Generate project code
      const generator = new CodeGenerator(body as Blueprint);
      const generatedProject = generator.generate();

      console.log('Project generation successful:', {
        totalFiles: generatedProject.summary.totalFiles,
        technologies: generatedProject.summary.technologies,
      });

      // Create project record in database
      const projectRecord = await ProjectDatabase.createProject(
        session.user.id,
        body as Blueprint,
        generatedProject
      );

      // Initialize generation steps in database
      for (const stepName of GENERATION_STEPS) {
        await ProjectDatabase.createStep(projectRecord.id, stepName);
      }

      // Save generated blueprint to Supabase history
      const blueprintContent = JSON.stringify({
        projectId: projectRecord.id,
        projectName: body.projectName,
        description: body.description,
        files: generatedProject.files,
        summary: generatedProject.summary,
      }, null, 2);

      await saveBlueprintToHistory(
        session.user.id,
        body.projectName,
        blueprintContent,
        'code-generated'
      );

      // Return success response with project ID
      return NextResponse.json(
        {
          projectId: projectRecord.id,
          status: 'generating',
          message: 'Project created. Starting generation...',
          preview: {
            name: generatedProject.name,
            totalFiles: generatedProject.summary.totalFiles,
            technologies: generatedProject.summary.technologies,
            apiEndpoints: generatedProject.summary.apiEndpoints,
            components: generatedProject.summary.components,
          },
        },
        { status: 200 }
      );
    } catch (genError) {
      console.error('Code generation error:', genError);
      throw new Error(`Code generation failed: ${genError instanceof Error ? genError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Generate project error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate project';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error('Error stack:', errorDetails);
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: 500 }
    );
  }
}
