# Using Existing Blueprints with Agentic Builder

## Scenario: User Has Already Generated a Blueprint

User workflow:
```
1. User creates blueprint via chat (existing feature)
2. User refines blueprint through iterations
3. User decides: "Build this blueprint autonomously"
4. Agent uses EXISTING blueprint instead of generating new one
5. Skips Phase 1, starts directly from Phase 2 (Scaffolding)
```

## API Changes

### Original: Generate from Scratch
```typescript
POST /api/agent/start-build
{
  projectName: string;
  prompt: string;              // AI generates blueprint from this
  requirements?: {...};
}
```

### Enhanced: Use Existing Blueprint
```typescript
POST /api/agent/start-build
{
  projectName: string;
  blueprintId?: string;        // OPTION 1: Use saved blueprint
  blueprint?: object;          // OPTION 2: Inline blueprint
  prompt?: string;             // OPTION 3: Generate new blueprint
}

// Priority:
// 1. If blueprintId provided → fetch from DB
// 2. Else if blueprint provided → use directly
// 3. Else if prompt provided → generate new one
```

## Implementation

### Update AgentOrchestrator

```typescript
export interface BuildRequest {
  userId: string;
  projectName: string;
  
  // Three options (in priority order):
  blueprintId?: string;           // Existing saved blueprint
  blueprint?: GeneratedBlueprint;  // Inline blueprint object
  prompt?: string;                // Generate new blueprint
  
  requirements?: {
    techStack?: string[];
    features?: string[];
    deadline?: number;
  };
}

export class AgentOrchestrator {
  async buildProject(request: BuildRequest): Promise<AgentResult> {
    const projectId = await this.createProject(request);

    try {
      // Phase 1: Blueprint (CONDITIONAL)
      let blueprint: GeneratedBlueprint;
      
      if (request.blueprintId) {
        // OPTION 1: Fetch existing blueprint from DB
        blueprint = await this.fetchBlueprint(request.blueprintId);
        console.log(`Using existing blueprint: ${request.blueprintId}`);
        
      } else if (request.blueprint) {
        // OPTION 2: Use inline blueprint
        blueprint = request.blueprint;
        console.log(`Using provided blueprint`);
        
      } else if (request.prompt) {
        // OPTION 3: Generate new blueprint
        blueprint = await this.blueprintGenerator.generate(
          request.prompt,
          request.requirements
        );
        console.log(`Generated new blueprint from prompt`);
        
      } else {
        throw new Error('Must provide blueprintId, blueprint, or prompt');
      }

      // Save blueprint to project
      await this.updateProject(projectId, {
        blueprint,
        current_phase: 'scaffolding',
        progress_percentage: 10  // Phase 1 complete
      });

      // Phase 2-5: Same as before...
      // (Scaffolding → Building → Testing → Deployment)
    }
  }

  private async fetchBlueprint(blueprintId: string): Promise<GeneratedBlueprint> {
    const { data, error } = await supabase
      .from('blueprints')
      .select('blueprint')
      .eq('id', blueprintId)
      .single();

    if (error) throw new Error(`Blueprint not found: ${blueprintId}`);
    return data.blueprint;
  }
}
```

## User Experience

### Path 1: From Existing Saved Blueprint
```
User in /blueprints page:
- Sees saved blueprint "E-commerce Platform"
- Clicks "Build This" button
- Modal asks for project name
- Clicks "Start Build"
  ↓
AgentOrchestrator called with blueprintId
- Fetches blueprint from DB
- Skips Phase 1 (blueprint generation)
- Starts Phase 2 immediately
  ↓
Build proceeds: Scaffolding → Testing → Deployment
  ↓
"Live at: https://ecommerce-xyz.vercel.app"
```

### Path 2: From Chat, Refined Blueprint
```
User in /projects/[projectId] chat:

User: "I've refined my blueprint through our chat. 
       Can you build version 2 now?"

Agent: "I see your blueprint. Let me build it autonomously.
        Current blueprint:
        - Tech: Next.js, Node.js, PostgreSQL
        - Pages: Dashboard, Products, Cart, Checkout
        - Features: Authentication, Payments, Real-time Inventory
        
        Starting build... [Phase 1 skipped - using existing]"
  ↓
Agent immediately starts Phase 2
  ↓
Returns: "Built and deployed! https://..."
```

### Path 3: From Dashboard
```
User in /dashboard:

[Blueprints Tab]
- Shows list of saved blueprints
- Each has "Build" button

User clicks "Build" on "API Platform" blueprint
  ↓
Modal opens:
  Project Name: [text field]
  [Cancel] [Build]
  ↓
Starts autonomous build with existing blueprint
  ↓
Redirects to /projects/[newProjectId] with live logs
```

## Database Changes

### New Column in `blueprints` Table
```sql
ALTER TABLE blueprints
ADD COLUMN buildable BOOLEAN DEFAULT TRUE,
ADD COLUMN last_build_date TIMESTAMP,
ADD COLUMN build_count INTEGER DEFAULT 0;
```

### Link Projects to Source Blueprint
```sql
ALTER TABLE agentic_projects
ADD COLUMN source_blueprint_id UUID REFERENCES blueprints(id);
```

## API Endpoint

```typescript
// app/api/agent/start-build/route.ts

import { AgentOrchestrator } from '@/lib/agent/agent-orchestrator';
import { getServerSession } from 'next-auth';

const orchestrator = new AgentOrchestrator();

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();

  try {
    const result = await orchestrator.buildProject({
      userId: session.user.id,
      projectName: body.projectName,
      blueprintId: body.blueprintId,  // OPTION 1
      blueprint: body.blueprint,       // OPTION 2
      prompt: body.prompt,             // OPTION 3
      requirements: body.requirements
    });

    return Response.json({
      success: true,
      projectId: result.projectId
    });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

## Frontend: "Build Blueprint" Button

### In /blueprints Page

```typescript
// app/blueprints/page.tsx

function BlueprintCard({ blueprint }) {
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [building, setBuilding] = useState(false);

  const handleBuild = async () => {
    setBuilding(true);
    try {
      const res = await fetch('/api/agent/start-build', {
        method: 'POST',
        body: JSON.stringify({
          projectName,
          blueprintId: blueprint.id  // Use existing blueprint
        })
      });

      const { projectId } = await res.json();
      
      // Redirect to live build logs
      router.push(`/projects/${projectId}/build-logs`);
      
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="blueprint-card">
      <h3>{blueprint.vibe}</h3>
      <p>{blueprint.description}</p>
      
      {/* Show Build Button */}
      <button
        onClick={() => setShowBuildModal(true)}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
      >
        🚀 Build This
      </button>

      {/* Build Modal */}
      {showBuildModal && (
        <dialog open>
          <h2>Build Blueprint: {blueprint.vibe}</h2>
          
          <label>
            Project Name:
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Awesome Project"
            />
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => setShowBuildModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleBuild}
              disabled={!projectName || building}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {building ? 'Building...' : 'Start Build'}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
```

## Benefits of This Approach

| Scenario | Time Saved |
|----------|-----------|
| New blueprint from scratch | 0 min (full 5 phases) |
| Using existing blueprint | ~2 min (skip Phase 1) |
| Using refined blueprint | ~2 min (skip Phase 1) |
| Rebuild with tweaks | ~2 min (skip Phase 1) |

## Workflow: Iterate & Build

```
User iteration loop:
  1. Generate blueprint via chat
  2. Refine in conversation
  3. Save blueprint
  4. [NEW] Build autonomously
  5. See live results
  6. If changes needed: Go back to step 2
  7. Build new version with updated blueprint
```

## Example: User Workflow

```
User: "Build me an authentication system"
Bot: "Generated blueprint: 
      - Next.js with next-auth
      - JWT tokens
      - Email signup
      - OAuth with GitHub/Google
      
      [Approve] [Edit] [Build Now]"

User: "Can you add 2FA?"
Bot: "Updated blueprint to include:
      ✓ 2-factor authentication with TOTP
      
      [Approve] [Edit] [Build Now]"

User: "Perfect! Build it now"
Bot: "Starting autonomous build...
      - Using approved blueprint
      - Phase 1: Skipped (using existing)
      - Phase 2: Scaffolding... ✓
      - Phase 3: Building... ✓
      - Phase 4: Testing... ✓
      - Phase 5: Deploying... ✓
      
      Done! Live at: https://auth-system-xyz.vercel.app"

User: "Great! But add passwordless login"
Bot: "Updated blueprint with passwordless login
      
      [Rebuild with v2] or [Start from prompt]"

User: "Rebuild with v2"
Bot: "Building v2...
      - Phase 1: Skipped (using blueprint v2)
      - Phase 2-5: In progress...
      
      Done! New version at: https://auth-system-xyz-v2.vercel.app"
```

## Summary

The agentic builder is **smart enough to use existing blueprints**, allowing:

1. **No redundant generation** - Don't regenerate if blueprint already exists
2. **Fast iteration** - Build, review, refine, rebuild in minutes
3. **Version control** - Each blueprint can be built multiple times
4. **Flexible input** - Users can provide blueprint 3 different ways
5. **Seamless UX** - "Build" button on saved blueprints in the UI
