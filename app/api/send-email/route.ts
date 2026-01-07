import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to } = body;

    if (!to || !type) {
      return NextResponse.json(
        { error: 'Email recipient and type are required' },
        { status: 400 }
      );
    }

    // Email sending is handled by specific API endpoints
    // This endpoint is deprecated - use dedicated email endpoints instead
    return NextResponse.json(
      { error: 'This endpoint is deprecated. Use specific email endpoints instead.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Send email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
