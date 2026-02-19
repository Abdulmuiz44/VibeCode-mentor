
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

      const prompt = `You are VibeCode Mentor, a world-class software architect and senior engineering mentor.
Generate a COMPLETE, production-ready project blueprint and full implementation plan for: "${projectIdea}"
${techStackPrompt}

**CRITICAL RULES:**
- Return strict, well-formatted Markdown.
- Be extremely specific and actionable — every section should give the developer exactly what they need to start coding immediately.
- Include real package names with version hints, real commands, real code snippets.
- Do NOT use vague placeholders. Every example should be realistic and contextual to the user's project.

**OUTPUT THE FOLLOWING SECTIONS IN ORDER:**

# 🚀 Project Blueprint: [Project Name]

## 📋 Project Overview
- **What it is:** One-paragraph description of the project.
- **Target Users:** Who will use this and why.
- **Core Value Proposition:** What makes this project useful or unique.
- **Key Features:** Bullet list of 5-8 core features.

## 🧠 Architectural Reasoning
- Explain *why* each chosen technology is the best fit for this specific idea.
- Discuss trade-offs (e.g., "Why Supabase over Firebase", "Why Next.js App Router over Pages Router").
- Mention scalability considerations.

## 📦 Tech Stack & Dependencies
List ALL packages the developer needs to install, grouped by category:
- **Frontend:** Framework, UI library, state management, form handling, etc.
- **Backend:** Server framework, ORM/query builder, validation, etc.
- **Database:** Database system, migration tools.
- **Authentication:** Auth library, providers.
- **DevOps:** Hosting, CI/CD, monitoring.
- **Utilities:** Date handling, email, file upload, etc.

Provide the exact install command:
\`\`\`bash
npm install [all packages listed]
\`\`\`

## 📁 Complete File Structure
Provide the FULL directory tree with brief annotations for important files:
\`\`\`
project-root/
├── src/ or app/
│   ├── (each file/folder with a comment explaining its purpose)
│   └── ...
├── lib/
├── components/
├── public/
├── .env.example
├── package.json
└── ...
\`\`\`

## 🗄️ Database Schema
Provide the COMPLETE database schema with SQL or equivalent:
\`\`\`sql
-- Full CREATE TABLE statements with:
-- - Primary keys, foreign keys
-- - Indexes for performance
-- - Constraints (NOT NULL, UNIQUE, CHECK)
-- - Row Level Security policies if using Supabase
-- - Timestamps (created_at, updated_at)
\`\`\`
Include an ER diagram description showing table relationships.

## 🔌 API Specification
For EVERY API endpoint the project needs:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | /api/... | ...         | Yes/No        |
| POST   | /api/... | ...         | Yes/No        |

For each endpoint, provide:
- Request body shape (TypeScript interface)
- Response shape (TypeScript interface)
- Error responses

## 🔐 Authentication & Authorization
- Describe the complete auth flow (sign up → verify → sign in → session).
- List user roles and their permissions.
- Show middleware/guard implementation approach.
- Provide the auth configuration code snippet.

## 🎨 UI/UX Pages & Components
For every page in the application:

| Page | Route | Purpose | Key Components |
|------|-------|---------|----------------|
| Home | /     | ...     | Hero, CTA, ... |

List reusable components with their props:
- \`ComponentName\` — description, props: \`{ prop1: type, prop2: type }\`

## 🛠️ Step-by-Step Implementation Guide

Provide a PHASED build plan. Each phase should have:
- Exact terminal commands to run
- Code snippets for key files
- What to verify before moving to next phase

### Phase 1: Project Setup & Configuration (Est. X hours)
1. Initialize the project with exact commands
2. Configure environment variables
3. Set up database connection
4. Verify: How to confirm setup is working

### Phase 2: Database & Data Layer (Est. X hours)
1. Run migrations / create tables
2. Set up ORM/client
3. Create data access functions
4. Verify: Test queries

### Phase 3: Authentication (Est. X hours)
1. Configure auth provider
2. Create sign-in/sign-up pages
3. Add protected route middleware
4. Verify: Test sign-in flow

### Phase 4: Core Features (Est. X hours)
1. Build each core feature with specific instructions
2. Include code snippets for complex logic
3. Verify: Test each feature

### Phase 5: UI Polish & Responsive Design (Est. X hours)
1. Apply styling system
2. Add loading states, error handling
3. Mobile responsiveness
4. Verify: Test on multiple screen sizes

### Phase 6: Testing (Est. X hours)
1. Unit test setup and example tests
2. Integration test examples
3. Verify: All tests pass

### Phase 7: Deployment (Est. X hours)
1. Platform-specific deployment steps
2. Environment variable configuration
3. Domain and DNS setup
4. Verify: Production site is live

## 🔑 Environment Variables
Provide a complete \`.env.example\` file:
\`\`\`env
# Database
DATABASE_URL=

# Auth
AUTH_SECRET=

# API Keys
# ... (every env var the project needs with descriptions)
\`\`\`

## 🧪 Testing Strategy
- **Unit Tests:** What to test, example test file
- **Integration Tests:** API route testing approach
- **E2E Tests:** Key user flows to test
- Provide 2-3 example test code snippets.

## 🚢 Deployment Guide
Step-by-step for the chosen hosting platform:
1. Build command
2. Environment variable setup
3. Database provisioning
4. Custom domain configuration
5. CI/CD pipeline setup (if applicable)

## 🤖 AI Implementation Prompts
Provide 5 highly specific, context-rich prompts the user can copy-paste into an AI coding assistant (Cursor, Copilot, VibeCode Builder) to implement key features:

### Prompt 1: [Feature Name]
\`\`\`
[Detailed, context-rich prompt with file references, tech stack context, and expected behavior]
\`\`\`

### Prompt 2: [Feature Name]
\`\`\`
[Detailed prompt...]
\`\`\`

### Prompt 3: [Feature Name]
\`\`\`
[Detailed prompt...]
\`\`\`

### Prompt 4: [Feature Name]
\`\`\`
[Detailed prompt...]
\`\`\`

### Prompt 5: [Feature Name]
\`\`\`
[Detailed prompt...]
\`\`\`

## ⚠️ Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| ...  | High/Med/Low | ... |

---
**This blueprint gives you everything you need. Start building now — phase by phase.** 🚀
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

      const prompt = `You are VibeCode Mentor, an expert software architect.
Generate a detailed, actionable project blueprint for: "${projectIdea}"
${techStackPrompt}

**RULES:** Return strict Markdown. Be specific and actionable — include real package names, real commands, real code patterns.

# 🚀 Project Blueprint: [Project Name]

## 📋 Project Overview
- **What it is:** One-paragraph description.
- **Target Users:** Who will use this.
- **Key Features:** Bullet list of 5-8 core features.

## 📦 Tech Stack & Dependencies
List all packages grouped by category (Frontend, Backend, Database, Auth, Utilities).
Provide the exact install command:
\`\`\`bash
npm install [all packages]
\`\`\`

## 📁 File Structure
Complete directory tree with annotations:
\`\`\`
project-root/
├── ...
\`\`\`

## 🗄️ Database Schema
Provide CREATE TABLE statements or equivalent schema definition:
\`\`\`sql
-- Tables with primary keys, foreign keys, constraints, indexes
\`\`\`

## 🔌 API Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| ...    | ...      | ...         | ...  |

Include request/response shapes for key endpoints.

## 🛠️ Step-by-Step Implementation Guide

### Phase 1: Setup (Est. X hours)
- Exact commands to initialize project
- Environment variables needed
- Database setup

### Phase 2: Core Backend (Est. X hours)
- Database connection
- API routes with code snippets
- Auth setup

### Phase 3: Frontend (Est. X hours)
- Pages to build
- Key components
- Styling approach

### Phase 4: Polish & Deploy (Est. X hours)
- Testing checklist
- Deployment steps for chosen platform
- Environment variable configuration

## 🔑 Environment Variables
\`\`\`env
# Complete .env.example with all required variables and descriptions
\`\`\`

## 🚢 Deployment Guide
- Build command
- Platform-specific deployment steps
- Database provisioning

## 🤖 AI Implementation Prompts
3 specific prompts to copy-paste into AI assistants:

### Prompt 1: [Feature]
\`\`\`
[Context-rich prompt]
\`\`\`

### Prompt 2: [Feature]
\`\`\`
[Context-rich prompt]
\`\`\`

### Prompt 3: [Feature]
\`\`\`
[Context-rich prompt]
\`\`\`

---
**Start building now — phase by phase.** 🚀
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
          max_tokens: 4000,
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
