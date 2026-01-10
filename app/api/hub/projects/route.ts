/**
 * Projects API Routes
 * POST   /api/hub/projects       - Create project
 * GET    /api/hub/projects       - List user's projects
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createProject, getUserProjects } from '@/lib/hub/projects';
import { ProjectCreateInput } from '@/types/hub';

/**
 * GET /api/hub/projects
 * List all projects for authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const visibility = searchParams.get('visibility');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const projects = await getUserProjects(session.user.id, {
            status: status || undefined,
            visibility: visibility || undefined,
            limit,
            offset,
        });

        return NextResponse.json(
            {
                projects,
                count: projects.length,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/hub/projects
 * Create a new project from a blueprint
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const input: ProjectCreateInput = {
            name: body.name,
            description: body.description,
            vibe: body.vibe,
            tech_stack: body.tech_stack,
            blueprint_id: body.blueprint_id,
            visibility: body.visibility || 'private',
            tags: body.tags,
        };

        // Validate required fields
        if (!input.name || !input.vibe) {
            return NextResponse.json(
                { error: 'Name and vibe are required' },
                { status: 400 }
            );
        }

        const project = await createProject(session.user.id, input);

        return NextResponse.json(
            {
                message: 'Project created successfully',
                project,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create project' },
            { status: 500 }
        );
    }
}
