
import { NextResponse } from 'next/server';
import { ProjectDatabase } from '@/lib/db/projects';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const templates = await ProjectDatabase.getTemplates();
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Failed to fetch templates:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}
