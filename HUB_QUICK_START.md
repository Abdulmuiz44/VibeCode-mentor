# VibeCode Hub - Quick Start Guide

## What is VibeCode Hub?

The transformation of VibeCode Mentor from a simple blueprint generator into a **collaborative development platform** where users can:
- Turn blueprints into tracked projects
- Work together in real-time
- Generate production code
- Build a snippet library
- Showcase projects to the community

---

## Current Implementation (Phase 1)

### What's Ready Now

#### 1. Project Creation
Users can now:
- Generate a blueprint on the home page
- Click "💼 Create Project in Hub" to create a tracked project
- View the project in the Hub dashboard

#### 2. Hub Dashboard
At `/hub`, users can see:
- All their projects
- Shared projects from teammates
- Project stats (members, files, status)
- Filter by tab (All, My Projects, Shared with Me)

#### 3. Project Workspace
At `/hub/projects/[id]`, users can view:
- Project overview and vision
- Tech stack
- Team members
- Tabs for Files, Team, and Activity

---

## Getting Started (Development)

### Step 1: Run the Database Migration

```bash
# Navigate to Supabase dashboard
# Go to SQL Editor
# Copy the contents of supabase/migrations/hub_schema.sql
# Run the migration

# OR use Supabase CLI:
supabase migration up
```

### Step 2: Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

### Step 3: Test the Flow

1. Go to `http://localhost:3000` (home page)
2. Generate a blueprint
3. Click "💼 Create Project in Hub"
4. Navigate to `/hub` to see your projects
5. Click on a project to view the workspace

### Step 4: Check the Console

Look for any errors related to:
- Supabase connection
- Authentication
- Database queries
- API routes

---

## Project Structure

```
app/
├── home/
│   └── HomeClient.tsx          (Updated with "Create Project" button)
├── hub/
│   ├── page.tsx                (Hub dashboard page)
│   ├── HubClient.tsx           (Dashboard UI)
│   └── projects/
│       └── [id]/
│           ├── page.tsx        (Workspace page)
│           └── ProjectWorkspaceClient.tsx (Workspace UI)
└── api/
    └── hub/
        ├── projects/
        │   ├── route.ts        (Create/List)
        │   └── [id]/
        │       ├── route.ts    (Get/Update/Delete)
        │       └── members/
        │           └── route.ts (Team management)

lib/hub/
├── projects.ts                 (Business logic)
└── utils.ts                    (Helper functions)

types/
└── hub.ts                      (TypeScript types)

supabase/
└── migrations/
    └── hub_schema.sql          (Database schema)
```

---

## Key Files & What They Do

### Database (`supabase/migrations/hub_schema.sql`)
- **projects** - Main project entity
- **project_members** - Team collaboration
- **project_files** - Generated code
- **snippets** - Reusable code library
- **project_activity** - Audit log
- **project_templates** - Code generation templates
- **project_collaborations** - Real-time presence
- **github_integrations** - GitHub OAuth

### Services (`lib/hub/projects.ts`)
Core functions:
- `createProject()` - Create new project
- `getProject()` - Fetch project details
- `updateProject()` - Update project info
- `addProjectMember()` - Add team members
- `getProjectMembers()` - Fetch team
- `logProjectActivity()` - Log changes

### API Routes
```
POST   /api/hub/projects              Create project
GET    /api/hub/projects              List projects
GET    /api/hub/projects/[id]         Get project
PUT    /api/hub/projects/[id]         Update project
DELETE /api/hub/projects/[id]         Delete project
GET    /api/hub/projects/[id]/members List team
POST   /api/hub/projects/[id]/members Add member
```

---

## Next Steps (What to Build)

### Phase 2: Code Generation (Week 3-4)
- [ ] Create file service (`lib/hub/files.ts`)
- [ ] Create code templates system
- [ ] Build template UI
- [ ] Generate code files from templates
- [ ] Create file explorer component
- [ ] Add code preview with syntax highlighting

### Phase 3: Real-time Collaboration (Week 5-6)
- [ ] Set up WebSocket/Realtime
- [ ] Create presence indicators
- [ ] Implement real-time file editing
- [ ] Add comments & annotations
- [ ] Create collaboration UI

### Phase 4: Community (Week 7-8)
- [ ] Create snippet CRUD
- [ ] Build snippet library UI
- [ ] Create project showcase page
- [ ] Add social sharing
- [ ] Implement project cloning

### Phase 5: Polish (Week 9-10)
- [ ] Analytics dashboard
- [ ] GitHub integration
- [ ] Slack/Discord notifications
- [ ] Performance optimization
- [ ] Security hardening

---

## Common Tasks

### Add a New Project Service Function

In `lib/hub/projects.ts`:

```typescript
export async function newFunction(projectId: string, userId: string) {
    // Verify access
    await verifyProjectAccess(projectId, userId, 'editor');
    
    // Do something with Supabase
    const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('project_id', projectId);
    
    if (error) throw error;
    
    // Log activity
    await logProjectActivity(projectId, userId, 'action_name');
    
    return data;
}
```

### Add a New API Route

Create `app/api/hub/path/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Your logic here

        return NextResponse.json({ data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'An error occurred' },
            { status: 500 }
        );
    }
}
```

### Add a New UI Component

Create `components/Hub/ComponentName.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Props {
    // Define props
}

export default function ComponentName({ }: Props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load data
    }, []);

    return (
        <div className="...">
            {/* JSX here */}
        </div>
    );
}
```

---

## Troubleshooting

### "Project not found" error
- Check Supabase connection
- Verify project ID in URL
- Ensure migration has run

### "Unauthorized" error
- Check session/authentication
- Verify RLS policies
- Check user permissions

### API route not working
- Check route file location
- Verify HTTP method (GET/POST/etc)
- Check request headers

### Database connection error
- Verify Supabase credentials in `.env.local`
- Check Supabase project status
- Test connection in Supabase dashboard

---

## Database Queries (Reference)

### Get a user's projects
```sql
SELECT * FROM projects 
WHERE owner_id = 'user_id'
ORDER BY created_at DESC;
```

### Get project with members
```sql
SELECT p.*, COUNT(pm.id) as member_count
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE p.id = 'project_id'
GROUP BY p.id;
```

### Get recent activity
```sql
SELECT * FROM project_activity
WHERE project_id = 'project_id'
ORDER BY created_at DESC
LIMIT 50;
```

---

## Performance Tips

1. **Use indexes** - Already created in migration
2. **Paginate results** - Use limit/offset in API
3. **Cache queries** - Use React Query or SWR
4. **Lazy load** - Load tabs/sections on demand
5. **Optimize images** - Resize user avatars

---

## Security Checklist

- [x] RLS policies enabled on all tables
- [x] Authentication required for all mutations
- [x] User ID validated on server
- [x] Project access verified before operations
- [ ] Rate limiting on API routes
- [ ] Input validation on all endpoints
- [ ] CSRF protection
- [ ] XSS prevention

---

## Documentation Links

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [NextAuth.js](https://next-auth.js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Getting Help

1. Check existing code examples in the codebase
2. Review the HUB_IMPLEMENTATION_CHECKLIST.md
3. Check Supabase/Next.js documentation
4. Test in browser console/Network tab
5. Check Supabase logs for database errors

---

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test
```

---

## Current Status

**Phase 1 Foundation: ~50% Complete**

### Working Now ✅
- Database schema
- Project creation API
- Hub dashboard
- Project workspace pages
- Team member management (basic)
- Activity logging

### Coming Next 🚧
- File generation engine
- Code templates
- Real-time collaboration
- Snippet library
- GitHub integration
- Analytics

### Architecture Ready ✅
- Type system
- Service layer
- API layer
- Database layer
- Authentication/authorization

---

## Contact & Questions

See ADMIN_SYSTEM_SUMMARY.md or START_HERE.md for more info about the overall system.

Happy building! 🚀

