/**
 * Project Workspace Page
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import ProjectWorkspaceClient from './ProjectWorkspaceClient';

interface Props {
    params: Promise<any>;
    searchParams: Promise<any>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    // You could fetch the project here to get actual metadata
    return {
        title: `Project - VibeCode Mentor`,
        description: 'Collaborative development workspace',
    };
}

export default async function ProjectWorkspacePage({ params }: Props) {
    const session = await getServerSession();
    const { id } = await params;

    if (!session?.user?.id) {
        redirect('/auth');
    }

    return <ProjectWorkspaceClient projectId={id} />;
}
