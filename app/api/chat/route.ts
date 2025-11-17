import { NextRequest, NextResponse } from 'next/server';
import { getProStatusFromCloud } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Chat rate limiting - stored in memory (consider using Redis for production)
const chatRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkChatRateLimit(userId: string | null, ip: string, isPro: boolean): {
  allowed: boolean;
  remaining: number;
  limit: number;
} {
  // Pro users have unlimited chats
  if (isPro) {
    return { allowed: true, remaining: 999, limit: 999 };
  }

  const identifier = userId || ip;
  const now = Date.now();
  const dailyLimit = 3;

  // Get or create rate limit entry
  let entry = chatRateLimits.get(identifier);

  // Reset if it's a new day
  if (!entry || now > entry.resetAt) {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    entry = { count: 0, resetAt: tomorrow.getTime() };
    chatRateLimits.set(identifier, entry);
  }

  // Check limit
  if (entry.count >= dailyLimit) {
    return { allowed: false, remaining: 0, limit: dailyLimit };
  }

  // Increment count
  entry.count += 1;
  chatRateLimits.set(identifier, entry);

  return { allowed: true, remaining: dailyLimit - entry.count, limit: dailyLimit };
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, blueprintContext, userId } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user's IP address
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check if user is Pro
    const isPro = userId ? await getProStatusFromCloud(userId) : false;

    // Rate limiting for free tier
    const rateLimit = checkChatRateLimit(userId, ip, isPro);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Chat limit reached',
          message: `You've used all ${rateLimit.limit} free chats today. Upgrade to Pro for unlimited AI assistance!`,
          remaining: rateLimit.remaining,
          limit: rateLimit.limit,
          isPro: false,
        },
        { status: 429 }
      );
    }

    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'MISTRAL_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Build context-aware system prompt
    let systemPrompt = `You are VibeCode Mentor's AI Assistant, an expert software architect and development advisor. You help users refine their project blueprints, answer technical questions, and provide guidance on implementation.

Your capabilities:
- Explain technical concepts clearly
- Suggest improvements to project blueprints
- Recommend tech stack alternatives
- Help with architecture decisions
- Debug conceptual issues
- Provide code examples when helpful

Keep responses:
- Concise but comprehensive
- Actionable and specific
- Friendly and encouraging
- Technical but accessible`;

    // Add blueprint context if available
    if (blueprintContext) {
      systemPrompt += `\n\nCurrent Blueprint Context:\n${blueprintContext.substring(0, 2000)}`;
    }

    // Prepare messages with conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    // Call Mistral API
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
      const errorText = await response.text();
      console.error('Mistral API Error:', errorText);
      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      response: aiResponse,
      remaining: rateLimit.remaining,
      limit: rateLimit.limit,
      isPro,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
