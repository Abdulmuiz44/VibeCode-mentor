
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { ProjectDatabase } from '@/lib/db/projects';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { templateId, name } = await request.json();

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        // Check usage limits? (Optional, but good practice. Assuming user is allowed if frontend checked)

        const newProject = await ProjectDatabase.cloneTemplate(templateId, session.user.id, name);

        return NextResponse.json(newProject);
    } catch (error) {
        console.error('Clone template error:', error);
        return NextResponse.json({ error: 'Failed to clone template' }, { status: 500 });
    }
}
