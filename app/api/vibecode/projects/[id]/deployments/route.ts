
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { DeploymentDatabase } from '@/lib/db/deployments';
import { use } from 'react';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = await params;

        const deployments = await DeploymentDatabase.getDeploymentsByProject(projectId);
        return NextResponse.json(deployments);
    } catch (error) {
        console.error('Fetch deployments error:', error);
        return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 });
    }
}
