import { NextRequest, NextResponse } from 'next/server';
import { getTopVibes } from '@/lib/kv';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Add timeout to KV operations
    const timeoutPromise = new Promise<Array<{ vibe: string; count: number }>>((resolve) => {
      setTimeout(() => resolve([]), 3000); // 3 second timeout
    });

    const vibesPromise = getTopVibes(10);
    const topVibes = await Promise.race([vibesPromise, timeoutPromise]);

    return NextResponse.json({
      vibes: topVibes || [],
    });
  } catch (error) {
    console.warn('Failed to fetch top vibes (returning empty array):', error);
    // Return empty array instead of error to prevent frontend issues
    return NextResponse.json({
      vibes: [],
    });
  }
}
