import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, content, author } = body;

    if (!articleId || !content || !author) {
      return Response.json(
        { error: 'Missing required fields: articleId, content, author' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return Response.json(
        { error: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: 'Comment received',
      comment: {
        id: Date.now().toString(),
        articleId,
        author,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Comments API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const articleId = request.nextUrl.searchParams.get('articleId');

    if (!articleId) {
      return Response.json(
        { error: 'articleId query parameter is required' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      articleId,
      comments: [],
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
