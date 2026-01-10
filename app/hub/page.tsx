/**
 * Hub Home Page - Project dashboard and navigation
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import HubClient from './HubClient';

export const metadata: Metadata = {
    title: 'Project Hub - VibeCode Mentor',
    description: 'Manage your projects, collaborate with teams, and build together',
};

export default async function HubPage() {
    const session = await getServerSession();

    if (!session?.user?.id) {
        redirect('/auth');
    }

    return <HubClient />;
}
