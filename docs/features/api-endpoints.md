# API Endpoints Documentation

## Overview
This document describes all API endpoints available in VibeCode Mentor.

## Existing Endpoints

### Blueprint Generation
**POST** `/api/mentor`
- Generate AI-powered project blueprints
- Input: Project idea, options
- Output: Markdown blueprint

### Chat Assistant
**POST** `/api/chat`
- Context-aware AI chat assistance
- Input: Message, context
- Output: AI response

### GitHub Export
**POST** `/api/export/github-repo`
- Create GitHub repository from blueprint
- Input: Token, repo name, blueprint content
- Output: Repository URL

### Payment
**POST** `/api/checkout`
- Initiate Flutterwave payment
- Input: User details
- Output: Payment link

**POST** `/api/webhook`
- Handle Flutterwave webhooks
- Input: Payment event data
- Output: Success/failure

### Email Notifications
**POST** `/api/send-email`
- Send transactional emails
- Types: welcome, payment-confirmation, rate-limit-warning, weekly-summary
- Input: Email type, recipient, params
- Output: Success/error

### Usage Tracking
**GET/POST** `/api/usage`
- Track and retrieve user usage stats
- Input: User ID
- Output: Generation counts, chat counts

### Admin
**POST** `/api/admin/auth`
- Admin authentication
- Input: Password
- Output: Auth token

**GET** `/api/admin/analytics`
- Retrieve analytics data
- Requires: Admin auth
- Output: Usage statistics

### Prompts
**GET/POST** `/api/prompts`
- Manage custom prompts
- GET: Retrieve prompts
- POST: Save new prompts

## New Endpoints (To Be Implemented)

### AI Blueprint (Enhanced)
**POST** `/api/ai/blueprint`
- Generate structured JSON blueprint
- Input: `{ idea, options: { complexity, platform, features[] } }`
- Output:
```json
{
  "title": "string",
  "summary": "string",
  "scope": ["feature1", "feature2"],
  "stack": {
    "frontend": "Next.js 14",
    "backend": "Node.js",
    "db": "Firestore"
  },
  "systemDesign": {
    "modules": [{
      "name": "auth",
      "endpoints": ["POST /api/auth/login"]
    }]
  },
  "folderStructure": ["src/components", "src/pages"],
  "tasks": [{
    "title": "Setup project",
    "estimateHours": 4,
    "sprint": 1
  }],
  "filespec": [{
    "path": "src/components/Login.tsx",
    "language": "tsx",
    "contentPreview": "..."
  }]
}
```

### UI Generator
**POST** `/api/ai/ui-generate`
- Generate UI screens and components
- Input: `{ blueprintId, platform: 'web'|'mobile', style: 'minimal'|'modern', screenCount: number }`
- Output:
```json
{
  "screens": [{
    "name": "Login",
    "route": "/login",
    "components": ["LoginForm", "SocialButtons"]
  }],
  "componentDefs": [{
    "name": "LoginForm",
    "props": ["onSuccess"],
    "jsx": "...tailwind component code..."
  }],
  "wireframes": ["ascii art preview"]
}
```

### Code Generator
**POST** `/api/ai/code-generate`
- Generate specific code files
- Input: `{ fileSpec: { path, componentName, props, language }, context }`
- Output:
```json
{
  "path": "src/components/Login.tsx",
  "content": "...full file content...",
  "dependencies": ["react", "firebase/auth"],
  "instructions": "..."
}
```

### Scaffold Generator
**POST** `/api/scaffold/generate`
- Generate downloadable project scaffold
- Input: `{ blueprint: BlueprintJSON }`
- Output: ZIP file stream

**POST** `/api/scaffold/push-github` (Pro)
- Create GitHub repo with scaffold
- Input: `{ blueprint, repoName, isPrivate }`
- Output: `{ repoUrl, success }`

### Estimator
**POST** `/api/ai/estimate`
- Analyze and estimate build complexity
- Input: `{ blueprint }`
- Output:
```json
{
  "estimatedHours": 120,
  "difficulty": 7,
  "hostingCostEstimate": 25,
  "risks": ["real-time features require WebSocket", "payment PCI compliance"],
  "skillsRequired": ["React", "Node.js", "Firebase"]
}
```

## Authentication
Most endpoints require Firebase auth token:
```
Authorization: Bearer <firebase-id-token>
```

## Rate Limiting
- Free users: 10 generations/day, 3 chats/day
- Pro users: Unlimited
- Rate limit tracked via Vercel KV

## Error Responses
All endpoints return consistent error format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Status Codes
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden (rate limit, pro required)
- 500: Internal server error
