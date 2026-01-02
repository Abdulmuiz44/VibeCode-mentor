# Admin System Integration Examples

How to use the admin system in existing API routes and components.

## In API Routes

### Example 1: Bypass Rate Limiting for Admins

In `app/api/mentor/route.ts`:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getAdminUser } from '@/lib/admin/adminManager';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session.user.id;

  // Check if user is admin
  const adminUser = await getAdminUser(userId);

  // Admin users bypass rate limits
  if (!adminUser?.has_unlimited_generations) {
    // Apply rate limit check for regular users
    const { data: blueprintCount } = await supabaseAdmin
      .from('blueprints')
      .select('count', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', thirtyMinutesAgo);

    if (blueprintCount >= RATE_LIMIT) {
      return Response.json(
        { error: 'Rate limit exceeded. Upgrade to Pro.' },
        { status: 429 }
      );
    }
  }

  // Process blueprint generation
  const blueprint = await generateBlueprint(request);
  return Response.json(blueprint);
}
```

### Example 2: Admin-Only Endpoint

In `app/api/admin/users/route.ts`:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { isAdminUser } from '@/lib/admin/adminManager';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const isAdmin = await isAdminUser(session.user.id);
  if (!isAdmin) {
    return Response.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  // Admin-only logic here
  const { data: allUsers } = await supabaseAdmin
    .from('users')
    .select('*');

  return Response.json({ users: allUsers });
}
```

### Example 3: Bypass Payment for Admins

In `app/api/export/github-repo/route.ts`:

```typescript
import { getAdminUser } from '@/lib/admin/adminManager';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session.user.id;

  const adminUser = await getAdminUser(userId);
  const isPro = adminUser?.is_pro || userProStatus;
  const canExport = adminUser?.has_unlimited_exports || isPro;

  if (!canExport) {
    return Response.json(
      { error: 'Upgrade to Pro to export code' },
      { status: 403 }
    );
  }

  // Process GitHub export
  const repo = await createGitHubRepo(request);
  return Response.json(repo);
}
```

## In React Components

### Example 1: Show Admin Badge

```typescript
'use client';

import { useAdminStatus } from '@/hooks/useAdminStatus';

export function UserBadge() {
  const admin = useAdminStatus();

  if (admin.loading) return null;

  return (
    <div className="flex items-center gap-2">
      {admin.isAdmin && (
        <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
          ADMIN
        </span>
      )}
      {admin.isPro && !admin.isAdmin && (
        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
          PRO
        </span>
      )}
    </div>
  );
}
```

### Example 2: Admin-Only UI Section

```typescript
'use client';

import { useAdminStatus } from '@/hooks/useAdminStatus';

export function AdminDashboard() {
  const admin = useAdminStatus();

  if (admin.loading) return <LoadingSpinner />;
  if (!admin.isAdmin) return <UnauthorizedMessage />;

  return (
    <div className="admin-panel">
      <h1>Admin Dashboard</h1>
      <UserManagement />
      <AnalyticsPanel />
      <SystemHealth />
    </div>
  );
}
```

### Example 3: Hide Rate Limit Warning for Admins

```typescript
'use client';

import { useAdminStatus } from '@/hooks/useAdminStatus';

export function GenerationLimitInfo() {
  const admin = useAdminStatus();

  if (admin.isAdmin) {
    return <div>Unlimited generations available</div>;
  }

  return (
    <div className="warning">
      Free users: 3 generations per day
      <button>Upgrade to Pro for unlimited</button>
    </div>
  );
}
```

### Example 4: Conditional Export Options

```typescript
'use client';

import { useAdminStatus } from '@/hooks/useAdminStatus';

export function ExportMenu() {
  const admin = useAdminStatus();

  return (
    <div className="export-options">
      <button>📋 Copy</button>
      <button>📥 Download Markdown</button>

      {(admin.isPro || admin.isAdmin) && (
        <>
          <button>📄 Export to PDF</button>
          <button>🐙 Create GitHub Repo</button>
        </>
      )}

      {!admin.isPro && !admin.isAdmin && (
        <button className="upgrade">
          ⭐ Upgrade for more options
        </button>
      )}
    </div>
  );
}
```

## In Page Components

### Example: Build Full App Page with Admin Bypass

`app/build-full-app/page.tsx`:

```typescript
'use client';

import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useSession } from 'next-auth/react';

export default function BuildFullApp() {
  const { data: session } = useSession();
  const admin = useAdminStatus();

  // Redirect if not authenticated
  if (!session?.user) {
    return <RedirectToSignIn />;
  }

  // Check access
  const hasAccess = admin.isPro || admin.isAdmin;

  if (!hasAccess) {
    return (
      <div className="upgrade-prompt">
        <h1>Upgrade to Pro</h1>
        <p>Build full apps and generate production-ready code.</p>
        <button onClick={() => router.push('/upgrade')}>
          Upgrade Now
        </button>
      </div>
    );
  }

  // Admin gets unlimited, Pro gets limited
  const generationLimit = admin.isAdmin ? 'Unlimited' : '1 per day';

  return (
    <div className="build-page">
      <div className="header">
        <h1>Generate Full App Code</h1>
        <p>Generations remaining today: {generationLimit}</p>
      </div>

      <CodeGenerator
        unlimited={admin.isAdmin || admin.hasUnlimitedGenerations}
      />
    </div>
  );
}
```

## In Data Fetching

### Example: Server-Side Access Check

In a Server Component or API route:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getAdminUser } from '@/lib/admin/adminManager';

export async function fetchUserData() {
  const session = await getServerSession(authOptions);
  const adminUser = await getAdminUser(session.user.id);

  // Include admin-only fields if user is admin
  const baseFields = ['id', 'email', 'name', 'created_at'];
  const allFields = adminUser
    ? [...baseFields, 'payments', 'api_keys', 'usage_logs']
    : baseFields;

  const { data: user } = await supabaseAdmin
    .from('users')
    .select(allFields.join(','))
    .eq('user_id', session.user.id)
    .single();

  return user;
}
```

## In Utilities

### Example: Reusable Rate Limit Check

Create `lib/admin/rateLimitUtils.ts`:

```typescript
import { getAdminUser } from './adminManager';
import { supabaseAdmin } from '@/lib/supabase.server';

export async function checkGenerationLimit(
  userId: string,
  dailyLimit: number = 3
): Promise<{ allowed: boolean; remaining: number }> {
  // Check if admin
  const admin = await getAdminUser(userId);

  // Admin users have no limit
  if (admin?.has_unlimited_generations) {
    return { allowed: true, remaining: -1 };
  }

  // Count generations today
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabaseAdmin
    .from('blueprints')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`);

  const remaining = Math.max(0, dailyLimit - (count || 0));

  return {
    allowed: remaining > 0,
    remaining,
  };
}
```

Then use it:

```typescript
const { allowed, remaining } = await checkGenerationLimit(userId);
if (!allowed) {
  return Response.json({ error: 'Rate limited' }, { status: 429 });
}
```

## Complete Example: Blueprint Generation with Admin Support

`app/api/mentor/route.ts`:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getAdminUser } from '@/lib/admin/adminManager';
import { supabaseAdmin } from '@/lib/supabase.server';
import { Mistral } from '@mistralai/mistralai';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectIdea } = await request.json();

    // Check admin status
    const adminUser = await getAdminUser(session.user.id);
    const isAdmin = !!adminUser;

    // Rate limiting (skip for admins)
    if (!isAdmin) {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabaseAdmin
        .from('blueprints')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .gte('created_at', `${today}T00:00:00`);

      if ((count || 0) >= 3) {
        return Response.json(
          { error: 'Rate limit exceeded. Upgrade to Pro.' },
          { status: 429 }
        );
      }
    }

    // Generate blueprint
    const mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    });

    const message = await mistral.messages.create({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'user',
          content: `Create a project blueprint for: ${projectIdea}`,
        },
      ],
    });

    const blueprint = message.choices[0].message.content;

    // Save to history
    await supabaseAdmin.from('blueprints').insert({
      user_id: session.user.id,
      project_idea: projectIdea,
      content: blueprint,
      created_at: new Date().toISOString(),
    });

    return Response.json({ blueprint });
  } catch (error) {
    console.error('Error in POST /api/mentor:', error);
    return Response.json(
      { error: 'Failed to generate blueprint' },
      { status: 500 }
    );
  }
}
```

## Testing

### Manual Testing Script

```javascript
// In browser console

// 1. Check admin status
const status = await fetch('/api/admin/status').then(r => r.json());
console.log('Admin Status:', status);

// 2. List all admins
const admins = await fetch('/api/admin/manage').then(r => r.json());
console.log('Admin Users:', admins);

// 3. Promote a user (replace with real user ID)
const promote = await fetch('/api/admin/manage', {
  method: 'POST',
  body: JSON.stringify({
    action: 'grant',
    targetUserId: 'user-123-abc'
  })
}).then(r => r.json());
console.log('Promotion Result:', promote);
```

---

**Remember**: Always verify admin status server-side before granting access to sensitive operations!
