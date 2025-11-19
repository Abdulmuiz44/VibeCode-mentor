import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/kv';
import { verifyAdminToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const authHeader = request.headers.get('authorization');

    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing admin token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!verifyAdminToken(token, adminPassword)) {
      return NextResponse.json({ error: 'Invalid or expired admin token' }, { status: 401 });
    }

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
