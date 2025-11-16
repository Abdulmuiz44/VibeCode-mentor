import { NextRequest, NextResponse } from 'next/server';
import { getProStatusFromCloud } from '@/lib/firebase';
import { getUIGeneratorPrompt, UIGeneratorPromptOptions } from '@/lib/ai-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, userId, platform = 'web', style = 'modern', screenCount = 5 } = body;

    if (!idea) {
      return NextResponse.json(
        { error: 'Project idea is required' },
        { status: 400 }
      );
    }

    // Check if user is Pro
    const isPro = userId ? await getProStatusFromCloud(userId) : false;

    if (!isPro) {
      return NextResponse.json(
        { error: 'Pro subscription required', message: 'UI Generator is a Pro feature. Upgrade to access!' },
        { status: 403 }
      );
    }

    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'MISTRAL_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Build prompt options
    const promptOptions: UIGeneratorPromptOptions = {
      idea,
      platform,
      style,
      screenCount,
    };

    const prompt = getUIGeneratorPrompt(promptOptions);

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
            content: 'You are a UI/UX expert. You MUST respond with ONLY valid JSON. No markdown, no code blocks - ONLY the raw JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'mistral-large-latest',
        stream: false,
        temperature: 0.8,
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
    let uiData;
    try {
      uiData = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      uiData,
      success: true,
    });
  } catch (error) {
    console.error('Error in UI generator API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
