import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory, blueprintContext, userId } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are VibeCode Mentor's AI Assistant, an expert software architect and development advisor. You help users refine their project blueprints, answer technical questions, and provide guidance on implementation.

Your capabilities:
- Explain technical concepts clearly
- Suggest improvements to project blueprints
- Recommend tech stack alternatives
- Help with architecture decisions
- Provide code examples when helpful

Keep responses concise, actionable, and friendly.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(conversationHistory) ? conversationHistory : []),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error(`Mistral API error: ${response.status}`);
      return Response.json(
        { error: 'AI service error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    return Response.json({
      response: aiResponse,
      success: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
