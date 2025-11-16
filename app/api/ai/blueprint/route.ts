import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, logGeneration } from '@/lib/kv';
import { getProStatusFromCloud, saveBlueprintToFirestore } from '@/lib/firebase';
import { getBlueprintPrompt, BlueprintPromptOptions } from '@/lib/ai-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, userId, complexity, platform, features } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'Project idea is required' },
        { status: 400 }
      );
    }

    // Get user's IP address
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check if user is Pro
    const isPro = userId ? await getProStatusFromCloud(userId) : false;

    // Rate limiting for free tier users only
    if (!isPro) {
      const rateLimit = await checkRateLimit(userId, ip);
      
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: `You've reached the limit of ${rateLimit.limit} free generations per day. Upgrade to Pro for unlimited access!`,
            current: rateLimit.current,
            limit: rateLimit.limit,
          },
          { status: 429 }
        );
      }
    }

    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'MISTRAL_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Build prompt options
    const promptOptions: BlueprintPromptOptions = {
      idea,
      complexity,
      platform,
      features,
    };

    const prompt = getBlueprintPrompt(promptOptions);

    // Call Mistral AI
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are VibeCode Mentor, an expert software architect. You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations - ONLY the raw JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'mistral-large-latest',
        stream: false,
        temperature: 0.7,
        max_tokens: 6000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API Error:', errorText);
      return NextResponse.json(
        { error: `Mistral API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content || '{}';
    
    // Parse the JSON response
    let blueprint;
    try {
      blueprint = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', rawContent);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      );
    }

    // Save to Firestore if user is authenticated
    let blueprintId = null;
    if (userId) {
      try {
        blueprintId = await saveBlueprintToFirestore(userId, {
          ...blueprint,
          originalIdea: idea,
          createdAt: new Date().toISOString(),
          isPro,
          options: { complexity, platform, features },
        });
        blueprint.id = blueprintId;
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        // Continue even if save fails
      }
    }

    // Log analytics
    await logGeneration(userId || null, idea, isPro);

    return NextResponse.json({ 
      blueprint,
      blueprintId,
      success: true,
    });
  } catch (error) {
    console.error('Error in AI blueprint API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
