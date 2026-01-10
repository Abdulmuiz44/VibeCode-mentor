import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ProjectDatabase } from '@/lib/db/projects';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const projects = await ProjectDatabase.getUserProjects(session.user.id);
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Fetch projects error:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        // Create an empty project first, then user can chat to add features
        const project = await ProjectDatabase.createEmptyProject(
            session.user.id,
            name,
            description || `A Next.js application called ${name}`
        );

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('Create project error:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
