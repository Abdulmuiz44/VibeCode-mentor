# VibeCode Mentor: Full-Stack Agentic App Builder Architecture

## Vision
Transform VibeCode Mentor from a static blueprint generator into a dynamic Full-Stack Agentic App Builder that autonomously:
1. **Plans**: Follow generated technical blueprints
2. **Builds**: Scaffold real Next.js + Node.js compliant codebases
3. **Tests**: Execute builds and tests in sandboxed Docker
4. **Deploys**: Push to live URLs with git-based workflows

## Core Architecture

### 1. Agent Pipeline
```
User Prompt → Blueprint Generation → Code Scaffolding → Build Execution → Testing → Deployment
```

### 2. Database Schema Extensions

#### `agentic_projects` table
```sql
CREATE TABLE agentic_projects (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_name TEXT NOT NULL,
  description TEXT,
  blueprint JSONB,           -- Technical specs from agent
  codebase JSONB,            -- Generated code files
  status TEXT,               -- 'planning' | 'building' | 'testing' | 'deploying' | 'deployed' | 'failed'
  github_repo_url TEXT,      -- Git repo URL
  deployed_url TEXT,         -- Live deployment URL
  docker_container_id TEXT,  -- Running container ID
  build_logs TEXT,           -- Build output
  test_results JSONB,        -- Test execution results
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE agent_execution_steps (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES agentic_projects(id),
  step_name TEXT,            -- 'blueprint_generation' | 'scaffolding' | 'build' | 'test' | 'deploy'
  status TEXT,               -- 'pending' | 'running' | 'completed' | 'failed'
  input JSONB,
  output JSONB,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE guardrails_config (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES agentic_projects(id),
  max_execution_time INTEGER,     -- seconds
  allowed_npm_packages TEXT[],    -- whitelist
  allowed_env_vars TEXT[],        -- whitelist
  max_disk_usage INTEGER,         -- MB
  network_access BOOLEAN,
  created_at TIMESTAMP
);
```

### 3. Agent Execution Flow

#### Phase 1: Planning
```
Input: Natural language prompt + optional requirements
Process:
  1. Parse user intent
  2. Generate technical blueprint (architecture, tech stack, components)
  3. Create project structure outline
Output: Detailed blueprint JSON with implementation roadmap
```

#### Phase 2: Scaffolding
```
Input: Blueprint from Phase 1
Process:
  1. Generate Next.js app structure
  2. Create API routes and database schemas
  3. Generate UI components
  4. Set up environment variables
Output: Full codebase as file tree
```

#### Phase 3: Building
```
Input: Generated codebase
Process:
  1. Initialize git repo
  2. Create Docker container
  3. Install dependencies (npm install)
  4. Build project (npm run build)
  5. Capture build logs
Output: Build artifacts or error logs
```

#### Phase 4: Testing
```
Input: Built project
Process:
  1. Run unit tests (Jest)
  2. Run integration tests
  3. Validate type checking (TypeScript)
  4. Check linting
Output: Test report JSON
```

#### Phase 5: Deployment
```
Input: Tested build
Process:
  1. Create git repository on GitHub
  2. Push code to repo
  3. Deploy to hosting (Vercel/Railway)
  4. Generate live URL
  5. Run smoke tests on live URL
Output: Deployed application URL
```

### 4. File Structure
```
app/
├── api/
│   ├── agent/
│   │   ├── generate-blueprint/route.ts      (phase 1)
│   │   ├── scaffold-project/route.ts        (phase 2)
│   │   ├── execute-build/route.ts           (phase 3)
│   │   ├── run-tests/route.ts               (phase 4)
│   │   └── deploy/route.ts                  (phase 5)
│   └── projects/
│       └── [projectId]/status/route.ts
│
├── projects/
│   └── [projectId]/
│       └── build-log/page.tsx               (real-time stream)
│
lib/
├── agent/
│   ├── agent.ts                             (main orchestrator)
│   ├── blueprint-generator.ts               (phase 1)
│   ├── code-scaffolder.ts                   (phase 2)
│   ├── docker-executor.ts                   (phase 3)
│   ├── test-runner.ts                       (phase 4)
│   └── deployer.ts                          (phase 5)
├── guardrails/
│   ├── execution-sandbox.ts
│   ├── resource-limits.ts
│   └── security-policies.ts
└── git/
    └── github-integration.ts
```

### 5. Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Agent Orchestration | Node.js + TypeScript | Coordinate pipeline |
| Code Generation | Mistral AI API | Generate blueprints & code |
| Sandboxing | Docker | Isolated build/test environment |
| Git Management | Octokit | GitHub integration |
| Deployment | Vercel API / Railway | Live hosting |
| Real-time Updates | Server-Sent Events | Stream build logs to UI |
| Database | Supabase PostgreSQL | Project & execution tracking |

### 6. Guardian Rails (Developer Controls)

**Resource Limits:**
- Max execution time: 30 minutes
- Max disk usage: 5GB
- Max memory: 4GB
- Max network calls: 1000

**Security Policies:**
- NPM packages whitelist (prevent malicious deps)
- Environment variables validation
- File system read/write restrictions
- Network access controls (internal only by default)

**Manual Controls:**
- Pause/resume execution at any step
- Approve code generation before build
- Override deployment decisions
- Rollback to previous versions

### 7. Integration with Existing Chat Interface

The existing `/projects/[projectId]/page.tsx` becomes the **control panel**:
```
User Chat Input
  ↓
VibeCode Architect (existing)
  ↓
Agentic Builder (new)
  ↓
Real-time Build Logs (UI)
  ↓
Live URL + GitHub Repo
```

### 8. API Contract

**Start Project Build**
```typescript
POST /api/agent/start-build
{
  projectId: string;
  prompt: string;
  requirements?: {
    tech_stack?: string[];
    features?: string[];
    deadline?: number;  // minutes
  }
}
Response:
{
  executionId: string;
  status: 'queued';
}
```

**Stream Build Progress**
```typescript
GET /api/agent/projects/:projectId/stream
// Server-Sent Events
event: phase-change
data: { phase: 'blueprinting', progress: 25 }

event: step-complete
data: { step: 'architecture', result: {...} }

event: complete
data: { deployedUrl: 'https://...', githubUrl: 'https://...' }
```

## Implementation Phases

### Phase 1: MVP (This sprint)
- [x] Architecture design
- [ ] Blueprint generator service
- [ ] Code scaffolding engine
- [ ] Basic Docker sandbox
- [ ] Database schema

### Phase 2: Core Agent (Next sprint)
- [ ] Build execution pipeline
- [ ] Test runner integration
- [ ] Real-time logs streaming
- [ ] Basic guardrails

### Phase 3: Deployment (Sprint 3)
- [ ] GitHub integration
- [ ] Vercel deployment
- [ ] Live URL generation
- [ ] Smoke testing

### Phase 4: Polish (Sprint 4)
- [ ] Advanced guardrails
- [ ] Admin dashboard
- [ ] Error recovery
- [ ] Performance optimization

## Security Considerations

1. **Sandbox Isolation**: Each build runs in dedicated Docker container
2. **Resource Limits**: CPU, memory, disk, network all capped
3. **Code Review**: Option to manually review before deployment
4. **Secrets Management**: Environment variables encrypted in DB
5. **Audit Logging**: All agent actions logged for compliance
6. **User Isolation**: Projects completely isolated per user

## Success Metrics

- Agent successfully builds 95% of projects
- Average build time < 5 minutes
- Zero security incidents
- 99.9% uptime for deployed applications
- Developer satisfaction > 4.5/5 stars
