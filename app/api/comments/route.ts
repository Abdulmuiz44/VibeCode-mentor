import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { addCollaborationComment, getCollaborationComments } from '@/lib/supabaseDB';

export const dynamic = 'force-dynamic';

function getBlueprintId(searchParams: URLSearchParams) {
  const idParam = searchParams.get('blueprintId');
  const id = Number(idParam);
  return Number.isNaN(id) ? null : id;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const blueprintId = getBlueprintId(request.nextUrl.searchParams);
  if (!blueprintId) {
    return NextResponse.json({ error: 'blueprintId is required' }, { status: 400 });
  }

  const comments = await getCollaborationComments(blueprintId);
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { blueprintId, content } = await request.json();
    const parsedBlueprintId = Number(blueprintId);
    if (!parsedBlueprintId || !content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const sanitizedContent = content.trim();
    if (!sanitizedContent) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    const author = session.user.name || session.user.email || 'Guest';
    const comment = await addCollaborationComment(parsedBlueprintId, author, sanitizedContent);
    if (!comment) {
      return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Collaboration comment error:', error);
    return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
  }
}
