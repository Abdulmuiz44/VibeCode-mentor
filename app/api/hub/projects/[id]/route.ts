/**
 * Project Detail API Routes
 * GET    /api/hub/projects/[id] - Get project details
 * PUT    /api/hub/projects/[id] - Update project
 * DELETE /api/hub/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getProject, updateProject, deleteProject, verifyProjectAccess } from '@/lib/hub/projects';
import { ProjectUpdateInput } from '@/types/hub';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/hub/projects/[id]
 * Get project details
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const session = await getServerSession();

        if (!id) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const project = await getProject(id);

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Check access permissions
        if (
            project.visibility === 'private' &&
            session?.user?.id !== project.owner_id
        ) {
            try {
                await verifyProjectAccess(id, session?.user?.id || '', 'viewer');
            } catch {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }
        }

        return NextResponse.json(
            { project },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/hub/projects/[id]
 * Update a project
 */
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const input: ProjectUpdateInput = body;

        const project = await updateProject(id, session.user.id, input);

        return NextResponse.json(
            {
                message: 'Project updated successfully',
                project,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error updating project:', error);

        if (error.message === 'Unauthorized' || error.message === 'Insufficient permissions') {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to update project' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/hub/projects/[id]
 * Delete a project
 */
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!id) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        await deleteProject(id, session.user.id);

        return NextResponse.json(
            { message: 'Project deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error deleting project:', error);

        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to delete project' },
            { status: 500 }
        );
    }
}
