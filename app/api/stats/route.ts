import { NextResponse } from 'next/server';
import { getLandingStats } from '@/lib/stats';

export async function GET() {
    try {
        const stats = await getLandingStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('API: Error fetching landing stats:', error);
        return NextResponse.json(
            {
                blueprintsCount: 0,
                usersCount: 0,
                rating: 4.8,
                error: error instanceof Error ? error.message : 'Failed to fetch stats'
            },
            { status: 500 }
        );
    }
}
