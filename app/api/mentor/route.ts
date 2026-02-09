
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, logGeneration } from '@/lib/kv';
import { getProStatusFromCloud, saveBlueprintToHistory } from '@/lib/supabase.server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { projectIdea, userId, techStack } = await request.json();

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
            message: `You've reached the limit of ${rateLimit.limit} free generations per month. Upgrade to Pro for unlimited access!`,
            current: rateLimit.current,
            limit: rateLimit.limit,
          },
          { status: 429 }
        );
      }
    }

    // Format tech stack requirements
    let techStackPrompt = '';
    if (techStack) {
      techStackPrompt = `
STRICT TECH STACK REQUIREMENTS:
- App Type: ${techStack.appType}
- Framework: ${techStack.framework}
- Database: ${techStack.database}
- UI Library: ${techStack.uiLibrary}
${techStack.hosting ? `- Hosting: ${techStack.hosting}` : ''}
${techStack.auth ? `- Authentication: ${techStack.auth}` : ''}

You MUST build the architecture using ONLY these specific technologies. Do not suggest alternatives.
`;
    }

    let blueprint = '';

    // --- PRO USERS: GEMINI 1.5 PRO ---
    if (isPro) {
        const googleApiKey = process.env.GOOGLE_AI_API_KEY;
        if (!googleApiKey) {
            console.error("GOOGLE_AI_API_KEY is missing");
             return NextResponse.json({ error: 'AI Service Configuration Error' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(googleApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `You are VibeCode Mentor, an expert software architect.
Generate a comprehensive, production-ready project blueprint for: "${projectIdea}"
${techStackPrompt}

**STRUCTURE & FORMAT:**
Return strict Markdown.

# 🚀 Project Blueprint: [Project Name]

## 🧠 Architectural Reasoning (Why this stack?)
- Explain *why* the chosen technologies are the best fit for this specific idea.
- Discuss trade-offs (e.g., "Why Supabase over Firebase", "Why Next.js App Router").
- **Goal:** Build trust with the developer by showing deep technical understanding.

## 📦 Tech Stack
- Frontend: [Framework, UI Library, State Management]
- Backend: [Framework, Database, API Style]
- DevOps: [Hosting, CI/CD, Auth]

## 📁 File Structure
\`\`\`
project-root/
├── src/
│   ├── components/
│   ├── app/ (if Next.js)
│   └── ...
\`\`\`

## 🤖 AI Prompts
Provide 3 highly specific prompts the user can copy-paste into an AI coding assistant (like Cursor or VibeCode's own builder) to implement key features.

### Prompt 1: [Core Feature A]
\`\`\`
[Context-rich prompt...]
\`\`\`

### Prompt 2: [Core Feature B]
\`\`\`
[Context-rich prompt...]
\`\`\`

### Prompt 3: [Core Feature C]
\`\`\`
[Context-rich prompt...]
\`\`\`

## 💻 Implementation Guide
- **Step 1: Setup:** \`npm install ...\`
- **Step 2: Database:** Schema setup...
- **Step 3: Deployment:** Vercel/Netlify steps...

---
**You shipped TradiaAI—ship this.**
`;
        
        const result = await model.generateContent(prompt);
        blueprint = result.response.text();

    } 
    // --- FREE USERS: AI ---
    else {
        const aiApiKey = process.env.MISTRAL_API_KEY;
        if (!aiApiKey) {
             console.error("MISTRAL_API_KEY is missing");
             return NextResponse.json({ error: 'AI Service Configuration Error' }, { status: 500 });
        }

        const prompt = `You are VibeCode Mentor, an expert software architect. Generate a project blueprint for: "${projectIdea}"
${techStackPrompt}

Return strict Markdown.

# 🚀 Project Blueprint

## 📦 Tech Stack
- List main technologies.

## 📁 File Structure
- Brief tree structure.

## 🤖 AI Prompts
Provide 3 prompts to help build this.

### Prompt 1
\`\`\`
[Prompt text]
\`\`\`

### Prompt 2
\`\`\`
[Prompt text]
\`\`\`

### Prompt 3
\`\`\`
[Prompt text]
\`\`\`

## 💻 Commands
Basic setup commands.

---
**You shipped TradiaAI—ship this.**
`;

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aiApiKey}`,
            },
            body: JSON.stringify({
                model: 'mistral-small-latest', 
                messages: [
                    { role: 'system', content: 'You are VibeCode Mentor.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AI API Error:', errorText);
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        blueprint = data.choices[0]?.message?.content || '';
    }

    // Log analytics
    await logGeneration(userId || null, projectIdea, isPro);

    // Save to history if user is logged in
    let blueprintId = null;
    if (userId) {
      const saved = await saveBlueprintToHistory(userId, projectIdea, blueprint);
      if (saved.success) {
        blueprintId = saved.id;
      }
    }

    return NextResponse.json({ blueprint, blueprintId });

  } catch (error) {
    console.error('Error in mentor API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
