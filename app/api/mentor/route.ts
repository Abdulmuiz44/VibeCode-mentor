import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, logGeneration } from '@/lib/kv';
import { getProStatusFromCloud } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { projectIdea, userId } = await request.json();

    if (!projectIdea) {
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

    const prompt = `You are VibeCode Mentor, an expert software architect and developer. Generate a complete, production-ready project blueprint for the following idea:

"${projectIdea}"

Your response MUST follow this exact structure in Markdown format:

# 🚀 Project Blueprint

## 📦 Tech Stack
- List all technologies, frameworks, and libraries
- Include versions where relevant
- Mention database, hosting, and deployment platforms

## 📁 File Structure
\`\`\`
project-root/
├── src/
│   ├── components/
│   ├── pages/
│   └── ...
├── package.json
└── ...
\`\`\`

## 🤖 AI Prompts

### Prompt 1: [Feature Name]
\`\`\`
[Detailed prompt for AI coding assistant]
\`\`\`

### Prompt 2: [Feature Name]
\`\`\`
[Detailed prompt for AI coding assistant]
\`\`\`

### Prompt 3: [Feature Name]
\`\`\`
[Detailed prompt for AI coding assistant]
\`\`\`

## 💻 Terminal Commands
\`\`\`bash
# Setup
npm install
# or
yarn install

# Development
npm run dev

# Build
npm run build

# Deploy
npm run deploy
\`\`\`

## 🌐 Vercel Deployment Steps

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. Configure environment variables:
   - Add all necessary API keys and secrets
5. Click "Deploy"
6. Your app will be live at: \`https://your-project.vercel.app\`

---

**You shipped TradiaAI—ship this.**

Make the blueprint actionable, specific, and production-ready. Include best practices and modern development patterns.`;

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
            content: 'You are VibeCode Mentor, an expert software architect who creates detailed, production-ready project blueprints.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'mistral-large-latest',
        stream: false,
        temperature: 0.7,
        max_tokens: 4000,
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
    const blueprint = data.choices[0]?.message?.content || '';

    // Log analytics
    await logGeneration(userId || null, projectIdea, isPro);

    return NextResponse.json({ blueprint });
  } catch (error) {
    console.error('Error in mentor API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
