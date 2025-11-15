import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/kv';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Simple auth check - in production, use proper session management
    const authHeader = request.headers.get('authorization');
    
    // For now, we rely on the auth endpoint and session storage on client
    // In production, implement JWT or session-based auth
    
    const analytics = await getAnalytics();
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
