/**
 * AI Prompts Library
 * Centralized prompts for Mistral AI integration
 */

export interface BlueprintPromptOptions {
  idea: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  platform?: 'web' | 'mobile' | 'desktop' | 'fullstack';
  features?: string[];
}

export interface UIGeneratorPromptOptions {
  idea: string;
  platform: 'web' | 'mobile';
  style: 'minimal' | 'modern' | 'professional' | 'playful';
  screenCount: number;
}

export interface CodeGeneratorPromptOptions {
  path: string;
  componentName: string;
  props?: string[];
  language: string;
  framework?: string;
  description?: string;
}

/**
 * Blueprint Generation Prompt
 * Returns structured JSON with scope, stack, tasks, etc.
 */
export function getBlueprintPrompt(options: BlueprintPromptOptions): string {
  const { idea, complexity = 'moderate', platform = 'web', features = [] } = options;
  
  return `You are VibeCode Mentor, an expert software architect. Generate a COMPLETE, STRUCTURED project blueprint for this idea:

"${idea}"

Complexity Level: ${complexity}
Platform: ${platform}
${features.length > 0 ? `Required Features: ${features.join(', ')}` : ''}

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations - ONLY the JSON object.

Return this EXACT JSON structure:

{
  "title": "Project Name",
  "summary": "1-2 sentence project overview",
  "scope": [
    "Authentication and user management",
    "Core feature 1",
    "Core feature 2",
    "Admin dashboard",
    "Payment integration (if applicable)"
  ],
  "stack": {
    "frontend": "Next.js 14 with TypeScript",
    "backend": "Next.js API Routes / Node.js",
    "database": "Firestore / PostgreSQL / MongoDB",
    "auth": "Firebase Auth / NextAuth",
    "styling": "Tailwind CSS",
    "hosting": "Vercel",
    "additional": []
  },
  "systemDesign": {
    "modules": [
      {
        "name": "authentication",
        "description": "User registration, login, password reset",
        "endpoints": ["POST /api/auth/login", "POST /api/auth/register", "POST /api/auth/reset"],
        "components": ["LoginForm", "RegisterForm", "AuthButton"]
      },
      {
        "name": "core-feature",
        "description": "Main feature description",
        "endpoints": ["GET /api/items", "POST /api/items", "PUT /api/items/:id"],
        "components": ["FeatureList", "FeatureCard", "FeatureForm"]
      }
    ],
    "database": {
      "collections": [
        {
          "name": "users",
          "fields": ["id", "email", "name", "createdAt", "isPro"]
        },
        {
          "name": "items",
          "fields": ["id", "userId", "title", "content", "createdAt"]
        }
      ]
    }
  },
  "folderStructure": [
    "app/",
    "app/api/",
    "app/api/auth/",
    "components/",
    "components/auth/",
    "components/feature/",
    "lib/",
    "lib/firebase.ts",
    "types/",
    "public/",
    "package.json",
    "tsconfig.json",
    "tailwind.config.ts"
  ],
  "tasks": [
    {
      "id": 1,
      "title": "Project setup and dependencies",
      "description": "Initialize Next.js, install packages, configure TypeScript",
      "estimateHours": 2,
      "difficulty": 1,
      "sprint": 1,
      "dependencies": []
    },
    {
      "id": 2,
      "title": "Authentication system",
      "description": "Implement user registration, login, and session management",
      "estimateHours": 8,
      "difficulty": 5,
      "sprint": 1,
      "dependencies": [1]
    },
    {
      "id": 3,
      "title": "Core feature implementation",
      "description": "Build main feature with CRUD operations",
      "estimateHours": 16,
      "difficulty": 7,
      "sprint": 2,
      "dependencies": [1, 2]
    }
  ],
  "filespec": [
    {
      "path": "app/layout.tsx",
      "language": "tsx",
      "purpose": "Root layout with providers",
      "contentPreview": "export default function RootLayout({ children }..."
    },
    {
      "path": "app/page.tsx",
      "language": "tsx",
      "purpose": "Home page",
      "contentPreview": "export default function HomePage() { return <div>..."
    },
    {
      "path": "components/auth/LoginForm.tsx",
      "language": "tsx",
      "purpose": "Login form component",
      "contentPreview": "export function LoginForm({ onSuccess }) { const [email..."
    }
  ],
  "hints": [
    "Use server components for better performance where possible",
    "Implement pagination for lists larger than 50 items",
    "Add proper error handling and loading states",
    "Consider implementing rate limiting for API routes",
    "Use environment variables for all sensitive credentials"
  ],
  "risks": [
    "Real-time features may require WebSocket setup",
    "Payment integration requires PCI compliance",
    "Consider GDPR compliance for EU users"
  ],
  "estimatedTotalHours": 40,
  "difficulty": 6,
  "monthlyHostingCost": 15
}

Ensure all arrays have at least 3-5 items. Be specific and actionable. Include all necessary technical details.`;
}

/**
 * UI Generator Prompt
 * Returns screens, components, and Tailwind JSX
 */
export function getUIGeneratorPrompt(options: UIGeneratorPromptOptions): string {
  const { idea, platform, style, screenCount } = options;
  
  return `You are a UI/UX expert. Generate ${screenCount} screens for this ${platform} application:

"${idea}"

Style: ${style}
Platform: ${platform}

CRITICAL: Respond with ONLY valid JSON. No markdown, no code blocks.

Return this EXACT JSON structure:

{
  "screens": [
    {
      "id": 1,
      "name": "Home",
      "route": "/",
      "description": "Landing page with hero and features",
      "components": ["Hero", "FeatureGrid", "CTASection"],
      "wireframe": "Simple ASCII art layout"
    },
    {
      "id": 2,
      "name": "Dashboard",
      "route": "/dashboard",
      "description": "Main user dashboard",
      "components": ["DashboardHeader", "StatsCards", "RecentActivity"],
      "wireframe": "Simple ASCII art layout"
    }
  ],
  "componentDefs": [
    {
      "name": "Hero",
      "description": "Hero section with title and CTA",
      "props": ["title", "subtitle", "ctaText"],
      "tailwindJSX": "export function Hero({ title, subtitle, ctaText }) { return <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'><div className='text-center'><h1 className='text-5xl font-bold text-gray-900'>{title}</h1><p className='mt-4 text-xl text-gray-600'>{subtitle}</p><button className='mt-8 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700'>{ctaText}</button></div></div>; }"
    },
    {
      "name": "DashboardHeader",
      "description": "Dashboard header with user info",
      "props": ["userName", "userEmail"],
      "tailwindJSX": "export function DashboardHeader({ userName, userEmail }) { return <div className='bg-white shadow-sm border-b border-gray-200 px-6 py-4'><div className='flex items-center justify-between'><div><h2 className='text-2xl font-bold text-gray-900'>Welcome, {userName}</h2><p className='text-sm text-gray-500'>{userEmail}</p></div><button className='px-4 py-2 bg-purple-600 text-white rounded-lg'>New Item</button></div></div>; }"
    }
  ],
  "colorPalette": {
    "primary": "#8b5cf6",
    "secondary": "#3b82f6",
    "accent": "#ec4899",
    "background": "#ffffff",
    "text": "#1f2937"
  },
  "typography": {
    "headings": "font-bold",
    "body": "font-normal",
    "sizes": ["text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-4xl"]
  }
}

Make the UI ${style} and ${platform}-optimized. All JSX must be valid, production-ready Tailwind CSS code.`;
}

/**
 * Code Generator Prompt
 * Returns specific file content
 */
export function getCodeGeneratorPrompt(options: CodeGeneratorPromptOptions): string {
  const { path, componentName, props = [], language, framework = 'React', description = '' } = options;
  
  return `You are an expert ${framework} developer. Generate PRODUCTION-READY code for this file:

Path: ${path}
Component/Module: ${componentName}
${props.length > 0 ? `Props: ${props.join(', ')}` : ''}
Language: ${language}
${description ? `Description: ${description}` : ''}

CRITICAL: Respond with ONLY valid JSON. No markdown, no explanations.

Return this EXACT JSON structure:

{
  "path": "${path}",
  "content": "// Full file content here\\nexport function ${componentName}() {\\n  return <div>...</div>;\\n}",
  "dependencies": ["react", "@/lib/firebase"],
  "imports": ["import { useState, useEffect } from 'react';", "import { auth } from '@/lib/firebase';"],
  "exports": ["${componentName}"],
  "description": "Component description",
  "usage": "import { ${componentName} } from '${path.replace('.tsx', '')}';"
}

Requirements:
- Use TypeScript with proper types
- Include error handling
- Add loading states where applicable
- Follow Next.js 14 best practices
- Use Tailwind CSS for styling
- Make it accessible (ARIA labels)
- Add helpful comments
- Make it production-ready`;
}

/**
 * Estimator Prompt
 * Analyzes blueprint and returns estimates
 */
export function getEstimatorPrompt(blueprint: any): string {
  return `You are a technical project manager. Analyze this blueprint and provide realistic estimates:

${JSON.stringify(blueprint, null, 2)}

CRITICAL: Respond with ONLY valid JSON.

Return this EXACT JSON structure:

{
  "totalEstimatedHours": 120,
  "breakdown": [
    {
      "phase": "Setup & Infrastructure",
      "hours": 8,
      "difficulty": 2
    },
    {
      "phase": "Authentication",
      "hours": 16,
      "difficulty": 5
    },
    {
      "phase": "Core Features",
      "hours": 60,
      "difficulty": 7
    },
    {
      "phase": "Testing & Deployment",
      "hours": 16,
      "difficulty": 4
    }
  ],
  "difficultyScore": 6,
  "skillsRequired": ["React", "TypeScript", "Node.js", "Database", "API Design"],
  "skillGaps": [
    {
      "skill": "Real-time features",
      "reason": "Requires WebSocket knowledge",
      "resources": ["https://socket.io/docs/", "Next.js + Socket.io tutorial"]
    }
  ],
  "monthlyHostingCost": 25,
  "hostingBreakdown": {
    "compute": 10,
    "database": 10,
    "storage": 2,
    "bandwidth": 3
  },
  "risks": [
    {
      "risk": "Payment integration complexity",
      "severity": "high",
      "mitigation": "Use established payment library like Stripe"
    }
  ],
  "timeline": {
    "solo": "6-8 weeks",
    "team2": "3-4 weeks",
    "team5": "2-3 weeks"
  }
}

Be realistic and thorough. Consider edge cases and production requirements.`;
}
