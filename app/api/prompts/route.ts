import { NextRequest, NextResponse } from 'next/server';
import { getTopVibes } from '@/lib/kv';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const topVibes = await getTopVibes(10);
    
    return NextResponse.json({
      vibes: topVibes,
    });
  } catch (error) {
    console.error('Error fetching top vibes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top vibes' },
      { status: 500 }
    );
  }
}
