import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const authHeader = request.headers.get('authorization');

    if (!adminPassword) {
      return Response.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Missing admin token' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (token !== adminPassword) {
      return Response.json(
        { error: 'Invalid or expired admin token' },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      message: 'Analytics data',
      data: {
        totalRequests: 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
