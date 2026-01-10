/**
 * Project Members API Routes
 * GET    /api/hub/projects/[id]/members - Get team members
 * POST   /api/hub/projects/[id]/members - Add team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import {
    getProjectMembers,
    addProjectMember,
    verifyProjectAccess,
} from '@/lib/hub/projects';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/hub/projects/[id]/members
 * Get project team members
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

        // Verify access
        if (session?.user?.id) {
            await verifyProjectAccess(id, session.user.id, 'viewer');
        }

        const members = await getProjectMembers(id);

        return NextResponse.json(
            { members },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error fetching members:', error);

        if (error.message === 'Unauthorized' || error.message === 'Insufficient permissions') {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to fetch members' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/hub/projects/[id]/members
 * Add a member to a project
 */
export async function POST(
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
        const { userId, email, role = 'viewer' } = body;

        if (!userId && !email) {
            return NextResponse.json(
                { error: 'User ID or email is required' },
                { status: 400 }
            );
        }

        // For now, we'll use userId if provided
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const member = await addProjectMember(id, userId, session.user.id, role);

        return NextResponse.json(
            {
                message: 'Member added successfully',
                member,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error adding member:', error);

        if (error.message === 'Unauthorized' || error.message === 'Insufficient permissions') {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Failed to add member' },
            { status: 500 }
        );
    }
}
