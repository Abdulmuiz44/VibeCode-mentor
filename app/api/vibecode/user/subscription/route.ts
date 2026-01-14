
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { SubscriptionDatabase } from '@/lib/db/subscriptions';
import { ProjectDatabase } from '@/lib/db/projects';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const [isPro, projects] = await Promise.all([
            SubscriptionDatabase.isPro(userId),
            ProjectDatabase.getUserProjects(userId)
        ]);

        return NextResponse.json({
            tier: isPro ? 'pro' : 'free',
            usage: {
                projects: projects.length,
                limit: isPro ? -1 : 3 // -1 for unlimited
            }
        });

    } catch (error) {
        console.error('Subscription API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
