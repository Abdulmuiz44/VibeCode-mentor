import { NextRequest, NextResponse } from 'next/server';
import { getProStatusFromCloud } from '@/lib/firebase';
import { getCodeGeneratorPrompt, CodeGeneratorPromptOptions } from '@/lib/ai-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, componentName, userId, props, language = 'tsx', framework = 'React', description } = body;

    if (!path || !componentName) {
      return NextResponse.json(
        { error: 'Path and component name are required' },
        { status: 400 }
      );
    }

    // Check if user is Pro (Code generator available to Pro users)
    const isPro = userId ? await getProStatusFromCloud(userId) : false;

    if (!isPro) {
      return NextResponse.json(
        { error: 'Pro subscription required', message: 'Code Generator is a Pro feature. Upgrade to access!' },
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
    const promptOptions: CodeGeneratorPromptOptions = {
      path,
      componentName,
      props,
      language,
      framework,
      description,
    };

    const prompt = getCodeGeneratorPrompt(promptOptions);

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
            content: 'You are an expert software developer. You MUST respond with ONLY valid JSON. No markdown, no code blocks - ONLY the raw JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'mistral-large-latest',
        stream: false,
        temperature: 0.5,
        max_tokens: 4000,
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
    let codeData;
    try {
      codeData = JSON.parse(rawContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      codeData,
      success: true,
    });
  } catch (error) {
    console.error('Error in code generator API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
