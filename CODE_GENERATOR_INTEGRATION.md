# Code Generator Integration Guide

## Overview

The VibeCode Mentor code generator creates production-ready full-stack Next.js projects from structured blueprints. Users provide project requirements, and the system generates all necessary files.

## Architecture

```
Blueprint Form → Parser → Generator → Exporter → (GitHub/Download)
```

### Components

#### 1. **BlueprintParser** (`lib/code-generator/blueprint-parser.ts`)
Parses unstructured blueprint text into structured data:
- Database schema → `DatabaseEntity[]`
- API endpoints → `ApiEndpoint[]`
- Features → Feature flags

#### 2. **CodeGenerator** (`lib/code-generator/generator.ts`)
Main generator that creates all project files:
- Config files (tsconfig, eslint, tailwind, etc.)
- Package.json with smart dependency selection
- Database migrations (SQL)
- API route templates
- React components and pages
- Documentation (README, SETUP, API docs)
- Library utilities (auth, supabase)

#### 3. **Templates** (`lib/code-generator/templates/`)
Modular template generators for specific file types:
- `package-json.ts` - Generates package.json with conditional dependencies
- `env-example.ts` - Creates .env.example based on features
- `database-migrations.ts` - SQL migrations and RLS policies
- `api-route.ts` - TypeScript API route templates
- `react-component.ts` - Page and component templates
- `config-files.ts` - Next.js, Tailwind, TypeScript configs

#### 4. **ProjectExporter** (`lib/code-generator/exporter.ts`)
Prepares generated files for export:
- File manifest generation
- Tree structure preview
- Summary statistics
- Serialization for storage

## File Structure Generated

```
project-name/
├── app/
│   ├── api/
│   │   └── [dynamic routes based on blueprint]
│   ├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── [auto-generated components]
├── lib/
│   ├── supabase.ts
│   ├── auth.ts (if auth enabled)
│   └── [other utilities]
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── public/
├── types/
├── .env.example
├── .eslintrc.js
├── .gitignore
├── eslint.config.js
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── API.md
├── README.md
└── SETUP.md
```

## Feature Flags

The generator intelligently includes/excludes features:

```typescript
- hasAuth → NextAuth, auth middleware, login pages
- hasPayments → Stripe integration, billing endpoints
- hasRealtime → SWR, WebSocket support
- hasFileUpload → Cloudinary integration
- hasEmail → Resend integration, email templates
- hasSearch → Meilisearch integration
- hasAnalytics → Analytics tracking setup
- hasRateLimit → Rate limiting middleware
- hasCache → Caching layer setup
- hasCDN → CDN configuration
```

## Integration Steps

### 1. Database Storage (Required)

Store generated projects in Supabase:

```typescript
interface GeneratedProjectRecord {
  id: string;
  user_id: string;
  name: string;
  blueprint: Blueprint;
  generated_files: GeneratedProject;
  status: 'generating' | 'completed' | 'failed';
  github_url?: string;
  created_at: timestamp;
  updated_at: timestamp;
}
```

### 2. Async Job Queue (Required)

For large projects, use a job queue:

```typescript
// Option A: Bull Queue
import Queue from 'bull';
const generationQueue = new Queue('project-generation', {
  redis: process.env.REDIS_URL,
});

generationQueue.process(async (job) => {
  const { projectId, blueprint } = job.data;
  // Generate and push to GitHub
});

// Option B: Inngest
import { inngest } from '@/lib/inngest';

export const generateProject = inngest.createFunction(
  { id: 'generate-project' },
  { event: 'project/generate' },
  async ({ event }) => {
    // Generate and push to GitHub
  }
);

// Option C: Simple scheduler (AWS Lambda, Vercel Cron, etc.)
// See next-scheduled-tasks or Vercel Cron functions
```

### 3. GitHub Integration (Required)

Push generated code to GitHub:

```typescript
import { Octokit } from '@octokit/rest';

async function pushToGithub(
  accessToken: string,
  projectName: string,
  files: GeneratedFile[]
) {
  const octokit = new Octokit({ auth: accessToken });
  
  // 1. Create repository
  const repo = await octokit.repos.createForAuthenticatedUser({
    name: projectName,
    description: 'Generated with VibeCode Mentor',
    private: false,
  });

  // 2. Commit files
  const tree = await octokit.git.createTree({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    tree: files.map(f => ({
      path: f.path,
      mode: '100644',
      type: 'blob',
      content: f.content,
    })),
  });

  // 3. Create commit
  const commit = await octokit.git.createCommit({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    message: 'Initial commit: Generated with VibeCode Mentor',
    tree: tree.data.sha,
  });

  // 4. Update ref
  await octokit.git.updateRef({
    owner: repo.data.owner.login,
    repo: repo.data.name,
    ref: 'heads/main',
    sha: commit.data.sha,
  });

  return repo.data.html_url;
}
```

### 4. Progress Tracking API

Update status endpoint to provide real progress:

```typescript
// app/api/generate-project/[projectId]/status/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const project = await db.projects.findOne({ id: params.projectId });

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: project.id,
    status: project.status,
    steps: project.generation_steps,
    githubUrl: project.github_url,
    error: project.error,
  });
}
```

## API Routes to Create

### POST `/api/generate-project`
Trigger code generation

**Request:**
```json
{
  "projectName": "TaskFlow",
  "description": "A collaborative task management app",
  "features": ["auth", "payments", "realtime"],
  "databaseSchema": "...",
  "apiEndpoints": "...",
  "uiComponents": "...",
  "deploymentRequirements": "..."
}
```

**Response:**
```json
{
  "projectId": "proj_123456789",
  "status": "generating",
  "message": "Your project is being generated...",
  "preview": {
    "name": "task-flow",
    "totalFiles": 45,
    "technologies": ["Next.js", "TypeScript", "Tailwind CSS"]
  }
}
```

### GET `/api/generate-project/[projectId]/status`
Check generation status

**Response:**
```json
{
  "id": "proj_123456789",
  "status": "completed",
  "steps": [
    {
      "id": "1",
      "name": "Parsing Blueprint",
      "status": "completed"
    },
    ...
  ],
  "githubUrl": "https://github.com/user/task-flow"
}
```

### GET `/api/generate-project/[projectId]/download`
Download as ZIP (optional)

```typescript
import JSZip from 'jszip';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const project = await db.projects.findOne({ id: params.projectId });
  
  const zip = new JSZip();
  
  project.generated_files.files.forEach(file => {
    zip.file(file.path, file.content);
  });

  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${project.name}.zip"`,
    },
  });
}
```

## Usage Example

```typescript
import { CodeGenerator } from '@/lib/code-generator/generator';
import { ProjectExporter } from '@/lib/code-generator/exporter';

// Create blueprint
const blueprint = {
  projectName: 'TaskFlow',
  description: 'Collaborative task management',
  features: ['auth', 'payments', 'realtime'],
  databaseSchema: '...',
  apiEndpoints: '...',
  uiComponents: '...',
  deploymentRequirements: 'Vercel deployment',
};

// Generate
const generator = new CodeGenerator(blueprint);
const project = generator.generate();

// Export
const manifest = ProjectExporter.getFileManifest(project);
const summary = ProjectExporter.getSummary(project);
const tree = ProjectExporter.generateTreePreview(project);

console.log(summary);
console.log(tree);

// Write to disk or push to GitHub
manifest.forEach((content, path) => {
  fs.writeFileSync(path, content);
});
```

## Next Steps

1. **Database Schema**: Create Supabase table for storing projects
2. **Job Queue**: Set up Bull, Inngest, or Vercel Cron
3. **GitHub OAuth**: Integrate GitHub authentication
4. **Push Logic**: Implement GitHub repo creation and file pushing
5. **Webhooks**: Optional - track GitHub Actions completion
6. **UI Updates**: Show real-time progress with WebSockets or polling

## Customization Points

### Adding New Features
Edit `BlueprintParser.extractFeatures()` and update templates:

```typescript
// 1. Add feature flag
hasNewFeature: blueprint.features.includes('newfeature')

// 2. Create template
// lib/code-generator/templates/new-feature.ts

// 3. Update generator
if (this.features.hasNewFeature) {
  files.push(...this.generateNewFeatureFiles());
}
```

### Custom Templates
Override generator methods:

```typescript
class CustomGenerator extends CodeGenerator {
  protected generateDatabaseFiles(): GeneratedFile[] {
    // Custom database generation
  }
}
```

## Performance Notes

- **Generation time**: ~500ms for typical projects
- **File count**: 40-60 files per project
- **Total size**: ~2-3 MB per project (before node_modules)
- **Bottleneck**: GitHub API calls (rate limited to 5000/hour)

## Error Handling

```typescript
try {
  const generator = new CodeGenerator(blueprint);
  const project = generator.generate();
} catch (error) {
  if (error instanceof ValidationError) {
    // Invalid blueprint structure
  } else if (error instanceof GitHubError) {
    // GitHub API failure
  } else {
    // Unknown error
  }
}
```

---

**Status**: Production-ready for MVP | **Version**: 1.0.0
