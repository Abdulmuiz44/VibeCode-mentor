# How the Agentic Builder Works

## User Journey

```
User types prompt in chat
        ↓
AgentOrchestrator receives request
        ↓
Executes 5-phase pipeline
        ↓
Returns live URL + GitHub repo
        ↓
User can interact with deployed app
```

## Detailed Workflow

### Phase 1: Blueprint Generation (Planning)
**Input:** Natural language prompt + optional requirements
**Output:** Technical specifications

```typescript
// User types in chat:
"Build me a SaaS project management app with authentication, 
real-time collaboration, and PostgreSQL"

// BlueprintGenerator processes this and returns:
{
  title: "Project Management SaaS",
  description: "Collaborative project planning tool...",
  techStack: {
    frontend: ["Next.js", "React", "TypeScript", "Tailwind"],
    backend: ["Node.js", "Express", "TypeScript"],
    database: ["PostgreSQL"],
    infrastructure: ["Docker", "Vercel"]
  },
  architecture: {
    pattern: "monolith",
    components: [
      { name: "API Server", technology: "Node.js + Express" },
      { name: "Web App", technology: "Next.js" },
      { name: "Database", technology: "PostgreSQL" }
    ]
  },
  api: {
    endpoints: [
      { method: "GET", path: "/api/projects", ... },
      { method: "POST", path: "/api/projects", ... },
      { method: "GET", path: "/api/tasks", ... }
    ]
  },
  ui: {
    pages: [
      { name: "Dashboard", route: "/" },
      { name: "Projects", route: "/projects" },
      { name: "Tasks", route: "/tasks" }
    ]
  }
}
```

### Phase 2: Code Scaffolding (Building Files)
**Input:** Blueprint specifications
**Output:** Complete project file structure

```
project-root/
├── package.json          ← Dependencies for all phases
├── next.config.mjs       ← Next.js configuration
├── tsconfig.json         ← TypeScript config
├── Dockerfile            ← Docker build instructions
├── tailwind.config.ts    ← Tailwind CSS setup
├── app/
│   ├── layout.tsx        ← Root layout
│   ├── page.tsx          ← Home page
│   ├── globals.css       ← Global styles
│   ├── api/
│   │   ├── projects/
│   │   │   └── route.ts  ← GET/POST /api/projects
│   │   ├── tasks/
│   │   │   └── route.ts  ← GET/POST /api/tasks
│   ├── projects/
│   │   └── page.tsx      ← Projects page
│   └── tasks/
│       └── page.tsx      ← Tasks page
├── components/
│   ├── Header.tsx        ← Navigation component
│   ├── ProjectCard.tsx   ← Reusable card component
│   └── Footer.tsx        ← Footer
├── lib/
│   ├── api.ts            ← API client utilities
│   └── auth.ts           ← Authentication helpers
└── types/
    └── index.ts          ← TypeScript types
```

**Example Generated File:**
```typescript
// app/api/projects/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Query database for projects
  const projects = await db.query('SELECT * FROM projects');
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  // Create new project
  const data = await request.json();
  const project = await db.query(
    'INSERT INTO projects (name, description) VALUES ($1, $2)',
    [data.name, data.description]
  );
  return NextResponse.json(project, { status: 201 });
}
```

### Phase 3: Build Execution (Docker Sandbox)
**Input:** Generated codebase
**Output:** Compiled application

```bash
# Inside Docker container:

Step 1: Install Dependencies
$ npm install
  ✓ Downloaded 487 packages
  ✓ Installed in 45 seconds

Step 2: Build Next.js Application
$ npm run build
  ✓ Compiled 12 pages
  ✓ Generated 34 API routes
  ✓ Build successful

Step 3: Type Checking
$ npx tsc --noEmit
  ✓ No TypeScript errors

Step 4: Linting
$ npm run lint
  ✓ All files pass ESLint
```

**Build Logs Streamed to UI:**
```
Building application...
  - Installing dependencies... ✓
  - Compiling TypeScript... ✓
  - Building Next.js... ✓
  - Running type checks... ✓
  - Build complete!
```

### Phase 4: Testing (Quality Assurance)
**Input:** Built application
**Output:** Test results

```bash
$ npm test

PASS  __tests__/pages/dashboard.test.tsx
  Dashboard Page
    ✓ renders correctly (125ms)
    ✓ displays user projects (89ms)
    ✓ handles project click (145ms)

PASS  __tests__/api/projects.test.ts
  Projects API
    ✓ GET /api/projects returns projects (234ms)
    ✓ POST /api/projects creates project (189ms)
    ✓ handles invalid input (67ms)

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Coverage:    85% statements, 78% branches
```

### Phase 5: Deployment (Going Live)
**Input:** Tested application
**Output:** Live URL + GitHub repository

**Step 1: Create GitHub Repository**
```bash
# Octakit creates repo
$ gh repo create project-abc123
✓ Repository created: https://github.com/vibecode/project-abc123
```

**Step 2: Push Code to GitHub**
```bash
$ git init
$ git add .
$ git commit -m "Initial commit: Project from VibeCode Mentor"
$ git push origin main
✓ Pushed 47 commits to GitHub
```

**Step 3: Deploy to Vercel**
```bash
$ vercel deploy
✓ Building... [████████████████] 100%
✓ Uploading artifacts...
✓ Deployment complete!
✓ URL: https://project-abc123.vercel.app
```

**Step 4: Run Smoke Tests**
```bash
Testing live URL: https://project-abc123.vercel.app
  ✓ Home page loads
  ✓ API responds
  ✓ Database connected
  ✓ All checks passed!
```

## Database Schema Used

### `agentic_projects` Table
```sql
id                 | uuid
user_id            | uuid (who owns it)
project_name       | text
blueprint          | jsonb (phase 1 output)
codebase           | jsonb (phase 2 output)
status             | text ('planning' → 'deployed')
current_phase      | text (which phase running)
progress_percentage| int (0-100)
build_logs         | text (detailed build output)
test_results       | jsonb (test data)
github_repo_url    | text (deployed repo)
deployed_url       | text (live application)
docker_container_id| text (build container)
created_at         | timestamp
completed_at       | timestamp
```

### `agent_execution_steps` Table
```sql
id            | uuid
project_id    | uuid (linked to agentic_projects)
step_name     | text ('blueprint_generation', 'scaffolding', 'build', 'test', 'deploy')
status        | text ('pending' → 'completed')
started_at    | timestamp
completed_at  | timestamp
logs          | text (step-specific logs)
output        | jsonb (step results)
error_message | text (if failed)
```

## Real-Time Updates (Server-Sent Events)

While building, the UI receives real-time updates:

```javascript
// Client-side (UI)
const eventSource = new EventSource(`/api/agent/projects/${projectId}/stream`);

eventSource.addEventListener('phase-change', (e) => {
  const { phase, progress } = JSON.parse(e.data);
  console.log(`Phase: ${phase}, Progress: ${progress}%`);
  // Update progress bar in UI
});

eventSource.addEventListener('step-complete', (e) => {
  const { step, result } = JSON.parse(e.data);
  console.log(`Step ${step} completed`);
  // Update build logs in UI
});

eventSource.addEventListener('complete', (e) => {
  const { deployedUrl, githubUrl } = JSON.parse(e.data);
  console.log(`Deployed to ${deployedUrl}`);
  // Show success message with links
});
```

## Security & Guardrails

### Resource Limits
```typescript
// What the agent CAN'T do:
- Execute for more than 30 minutes
- Use more than 4GB RAM
- Use more than 5GB disk space
- Make more than 1000 API calls
- Access network (unless approved)
```

### Security Checks
```typescript
// Before building:
1. Scan dependencies for known vulnerabilities
2. Check for hardcoded secrets (API keys, passwords)
3. Validate npm package whitelist
4. Inspect file permissions
5. Ensure no malicious code patterns
```

### Approval Checkpoints
```
Optional Manual Review:
- Developer can review generated code before build
- Can approve/reject entire project
- Can modify guardrails settings
- Can pause execution at any phase
```

## Error Handling & Recovery

### If Phase Fails
```
Build fails → Error message captured
             → Audit log entry created
             → User notified in chat
             → Can retry or cancel
```

### If Deployment Fails
```
Deploy fails → Rollback to previous version (if exists)
            → Error details logged
            → User can adjust and retry
            → GitHub branch preserved for debugging
```

## Integration with Chat Interface

The chat interface is the **command center**:

```
User: "Build a real-time chat app with WebSockets"
     ↓
Agent: "I'll create a full-stack app. Here's the plan:
        - Next.js frontend with real-time UI
        - Node.js backend with WebSocket support
        - PostgreSQL for message persistence
        
        Starting build... [Progress bar]"
     ↓
Agent: "Build succeeded! Testing... [Progress bar]"
     ↓
Agent: "All tests passed! Deploying... [Progress bar]"
     ↓
Agent: "🎉 Success! Your app is live:
        GitHub: https://github.com/...
        Live URL: https://project-xyz.vercel.app
        
        You can now start building features!"
```

## Example: Full Workflow

### User Prompt
```
"Create a todo list app where users can:
- Sign up and login
- Create, edit, and delete todos
- Mark todos as complete
- Share todo lists with others
- See real-time updates when others edit"
```

### Agent Execution (Automatic)

**Phase 1: Blueprint (2 min)**
```
✓ Architecture: Monolith with real-time features
✓ Frontend: Next.js 15 + React + TypeScript
✓ Backend: Node.js + Express + WebSocket
✓ Database: PostgreSQL with real-time subscriptions
✓ Features identified: Auth, CRUD, Sharing, WebSockets
```

**Phase 2: Code Generation (3 min)**
```
✓ Generated 23 TypeScript files
✓ Created 8 API endpoints
✓ Built 12 React components
✓ Set up 5 database tables
✓ Configured WebSocket server
```

**Phase 3: Build (2 min)**
```
✓ Installed 187 dependencies
✓ Built Next.js application
✓ Compiled TypeScript
✓ Generated optimized bundle
```

**Phase 4: Testing (1 min)**
```
✓ 24 unit tests passed
✓ 8 integration tests passed
✓ Coverage: 87%
✓ No TypeScript errors
```

**Phase 5: Deployment (1 min)**
```
✓ Created GitHub repository
✓ Pushed code to main branch
✓ Deployed to Vercel
✓ Smoke tests passed
✓ Live at: https://todo-app-xyz.vercel.app
```

**Total Time: ~10 minutes from prompt to live application**

## What Makes This Different

| Traditional | Agentic Builder |
|------------|-----------------|
| Manual setup | Automatic scaffolding |
| Copy/paste boilerplate | Generated from specs |
| Days to weeks | 10 minutes |
| Manual testing | Automated tests |
| Manual deployment | One-click deploy |
| Limited by developer skill | Consistent quality |
| No audit trail | Complete audit log |
| Risky code | Guardrails enforced |
