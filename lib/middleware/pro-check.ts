import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { SubscriptionDatabase } from '@/lib/db/subscriptions';

export async function checkProSubscription(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      isAuthed: false,
      isPro: false,
      error: 'Unauthorized',
      status: 401,
    };
  }

  try {
    const isPro = await SubscriptionDatabase.isPro(session.user.id);
    
    if (!isPro) {
      return {
        isAuthed: true,
        isPro: false,
        error: 'Pro subscription required',
        status: 403,
      };
    }

    return {
      isAuthed: true,
      isPro: true,
      userId: session.user.id,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      isAuthed: true,
      isPro: false,
      error: 'Failed to verify subscription',
      status: 500,
    };
  }
}

export function requireProResponse(isPro: boolean, isAuthed: boolean) {
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isPro) {
    return NextResponse.json(
      { error: 'Pro subscription required' },
      { status: 403 }
    );
  }
  return null;
}
