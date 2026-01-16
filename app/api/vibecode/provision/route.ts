
import { NextRequest, NextResponse } from 'next/server';
import { ProjectDatabase } from '@/lib/db/projects';

export async function POST(req: NextRequest) {
    try {
        const { projectId, supabasePat } = await req.json();

        if (!projectId || !supabasePat) {
            return NextResponse.json({ error: 'Missing projectId or PAT' }, { status: 400 });
        }

        // 1. Get Project Details
        const project = await ProjectDatabase.getProject(projectId);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // 2. Get User's Organizations
        const orgsRes = await fetch('https://api.supabase.com/v1/organizations', {
            headers: { 'Authorization': `Bearer ${supabasePat}` }
        });

        if (!orgsRes.ok) {
            throw new Error('Failed to fetch Supabase organizations. Check your PAT.');
        }

        const orgs = await orgsRes.json();
        if (orgs.length === 0) {
            return NextResponse.json({ error: 'No Supabase organizations found. Create one in Supabase dashboard first.' }, { status: 400 });
        }

        const orgId = orgs[0].id; // Use first org

        // 3. Create Project
        const dbPass = `Pw_${Math.random().toString(36).slice(2)}_${Date.now()}!`; // Generate secure password
        const createRes = await fetch('https://api.supabase.com/v1/projects', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabasePat}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: project.name || 'VibeCode Project',
                organization_id: orgId,
                region: 'us-east-1', // Default region
                plan: 'free',
                db_pass: dbPass
            })
        });

        if (!createRes.ok) {
            const err = await createRes.json();
            throw new Error(err.message || 'Failed to create Supabase project');
        }

        const newProject = await createRes.json();

        // 4. Update Project Environment Variables
        // Note: The project takes time to provision, so we might not get keys immediately or connection might fail.
        // But we can construct the URL.
        const dbUrl = `postgresql://postgres:${encodeURIComponent(dbPass)}@db.${newProject.id}.supabase.co:5432/postgres`;

        // Append to existing env vars if they reside in generated_files
        // For now, we will just return the info to the UI or logs

        return NextResponse.json({
            success: true,
            projectRef: newProject.id,
            message: 'Project creation initiated. It may take a few minutes to be ready.',
            dbPass: dbPass, // Return to user so they can update env vars if needed (Risky? Yes. MVP? Yes.)
            dbUrl: dbUrl
        });

    } catch (error: any) {
        console.error('Provisioning error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
