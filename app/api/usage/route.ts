import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUsage } from '@/lib/kv';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params or use IP
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    const current = await getCurrentUsage(userId, ip);
    const limit = 10;

    return NextResponse.json({
      current,
      limit,
      remaining: limit - current,
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}
