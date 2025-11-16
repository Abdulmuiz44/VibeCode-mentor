import { NextRequest, NextResponse } from 'next/server';
import { getEstimatorPrompt } from '@/lib/ai-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blueprint } = body;

    if (!blueprint) {
      return NextResponse.json(
        { error: 'Blueprint data is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'MISTRAL_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const prompt = getEstimatorPrompt(blueprint);

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
            content: 'You are a technical project manager. You MUST respond with ONLY valid JSON. No markdown, no code blocks - ONLY the raw JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'mistral-large-latest',
        stream: false,
        temperature: 0.3,
        max_tokens: 3000,
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
    let estimates;
    try {
      estimates = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      estimates,
      success: true,
    });
  } catch (error) {
    console.error('Error in estimator API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
