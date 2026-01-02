# Phase 1 Implementation Guide: Hub Foundation (Weeks 1-2)

## Overview
Transform the payment success page and app structure into a comprehensive hub system with proper navigation, database schema, and foundational components.

---

## Week 1: Database & Backend Foundation

### 1.1 Database Migrations

Create migration files in `supabase/migrations/`:

#### Migration 1: Create Projects Table
```sql
-- supabase/migrations/[timestamp]_create_projects_table.sql

CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  blueprint_id INTEGER REFERENCES public.blueprints(id),
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('idea', 'planning', 'in-progress', 'completed', 'archived')),
  repository_url VARCHAR(500),
  live_url VARCHAR(500),
  tech_stack JSONB DEFAULT '[]',
  team_members UUID[] DEFAULT '{}',
  visibility VARCHAR(50) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view public projects"
  ON public.projects FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view team projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = ANY(team_members));

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (user_id = auth.uid());
```

#### Migration 2: Create Project Phases
```sql
-- supabase/migrations/[timestamp]_create_project_phases.sql

CREATE TABLE public.project_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  order_index INTEGER NOT NULL,
  estimated_days INTEGER,
  tasks JSONB DEFAULT '[]',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_phases_project_id ON public.project_phases(project_id);
CREATE INDEX idx_phases_status ON public.project_phases(status);

-- Enable RLS
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "View phases through project"
  ON public.project_phases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_phases.project_id
    AND (projects.user_id = auth.uid() OR auth.uid() = ANY(projects.team_members))
  ));

CREATE POLICY "Manage phases through project"
  ON public.project_phases FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_phases.project_id
    AND projects.user_id = auth.uid()
  ));
```

#### Migration 3: Create Snippets Table
```sql
-- supabase/migrations/[timestamp]_create_snippets_table.sql

CREATE TABLE public.snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  language VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  tags VARCHAR[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  copies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_snippets_user_id ON public.snippets(user_id);
CREATE INDEX idx_snippets_language ON public.snippets(language);
CREATE INDEX idx_snippets_is_public ON public.snippets(is_public);
CREATE INDEX idx_snippets_tags ON public.snippets USING GIN(tags);
CREATE INDEX idx_snippets_created_at ON public.snippets(created_at DESC);

-- Full text search
CREATE INDEX idx_snippets_search ON public.snippets USING GIN(
  to_tsvector('english', title || ' ' || description || ' ' || code)
);

-- Enable RLS
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own snippets"
  ON public.snippets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public snippets"
  ON public.snippets FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create snippets"
  ON public.snippets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own snippets"
  ON public.snippets FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own snippets"
  ON public.snippets FOR DELETE
  USING (user_id = auth.uid());
```

#### Migration 4: Create Team Collaborations
```sql
-- supabase/migrations/[timestamp]_create_team_collaborations.sql

CREATE TABLE public.team_collaborations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'developer' CHECK (role IN ('owner', 'admin', 'developer', 'viewer')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_collab_project_id ON public.team_collaborations(project_id);
CREATE INDEX idx_collab_member_id ON public.team_collaborations(member_id);
CREATE INDEX idx_collab_owner_id ON public.team_collaborations(owner_id);
CREATE INDEX idx_collab_status ON public.team_collaborations(status);

-- Enable RLS
ALTER TABLE public.team_collaborations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "View own collaborations"
  ON public.team_collaborations FOR SELECT
  USING (owner_id = auth.uid() OR member_id = auth.uid());

CREATE POLICY "Manage own project collaborations"
  ON public.team_collaborations FOR ALL
  USING (owner_id = auth.uid());
```

#### Migration 5: Create Activity Log
```sql
-- supabase/migrations/[timestamp]_create_activity_log.sql

CREATE TABLE public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX idx_activity_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_project_id ON public.activity_logs(project_id);
CREATE INDEX idx_activity_created_at ON public.activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view project activity"
  ON public.activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = activity_logs.project_id
    AND (projects.user_id = auth.uid() OR auth.uid() = ANY(projects.team_members))
  ));
```

### 1.2 Create API Route Structure

Create the following API routes:

#### `app/api/projects/route.ts`
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user projects with filter options
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 10;

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total: count,
      pages: Math.ceil((count || 0) / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, blueprintId, techStack } = body;

  if (!name) {
    return NextResponse.json({ error: 'Project name required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: session.user.id,
      name,
      description,
      blueprint_id: blueprintId,
      tech_stack: techStack || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: session.user.id,
    project_id: data.id,
    action: 'created',
    entity_type: 'project',
    metadata: { projectName: name },
  });

  return NextResponse.json(data, { status: 201 });
}
```

#### `app/api/projects/[id]/route.ts`
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      phases:project_phases(*)
    `
    )
    .eq('id', params.id)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Check access
  if (project.user_id !== session.user.id && !project.team_members.includes(session.user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (!project || project.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: session.user.id,
    project_id: params.id,
    action: 'updated',
    entity_type: 'project',
    metadata: body,
  });

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (!project || project.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase.from('projects').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: session.user.id,
    project_id: params.id,
    action: 'deleted',
    entity_type: 'project',
  });

  return NextResponse.json({ success: true });
}
```

---

## Week 2: Frontend Foundation

### 2.1 Update Payment Success Flow

Modify `app/payment/success/page.tsx` to redirect to dashboard:

```typescript
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const [countdown, setCountdown] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      try {
        await updateSession();
        setIsLoading(false);
      } catch (error) {
        console.error('Error refreshing session:', error);
        setIsLoading(false);
      }
    };

    const timer = setTimeout(processPayment, 2000);
    return () => clearTimeout(timer);
  }, [updateSession]);

  useEffect(() => {
    if (!isLoading && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0 && !isLoading) {
      router.push('/dashboard');
    }
  }, [countdown, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-950/80 backdrop-blur shadow-2xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <div className="relative text-6xl">✓</div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white">
          Welcome to VibeCode Mentor Pro!
        </h1>

        <div className="text-sm text-gray-400">
          {isLoading ? (
            <span>Processing your upgrade...</span>
          ) : (
            <span>Redirecting to dashboard in {countdown}s...</span>
          )}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Go to Dashboard'}
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><div className="text-white">Loading...</div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
```

### 2.2 Create Dashboard Layout

Create `app/dashboard/layout.tsx`:

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardSidebar from '@/components/Hub/DashboardSidebar';
import DashboardHeader from '@/components/Hub/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 2.3 Create Hub Components

Create `components/Hub/DashboardSidebar.tsx`:

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/projects', label: 'Projects', icon: '📁' },
    { href: '/dashboard/generator', label: 'Generator', icon: '✨' },
    { href: '/dashboard/snippets', label: 'Snippets', icon: '📝' },
    { href: '/dashboard/team', label: 'Team', icon: '👥' },
    { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          VibeCode
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname === item.href
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 transition"
        >
          ⚙️ Settings
        </Link>
        <a
          href="/api/auth/signout"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 transition"
        >
          🚪 Sign Out
        </a>
      </div>
    </aside>
  );
}
```

Create `components/Hub/DashboardHeader.tsx`:

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useProStatus } from '@/hooks/useProStatus';
import Image from 'next/image';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const { isPro } = useProStatus();

  return (
    <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Pro Badge */}
        {isPro && (
          <div className="px-3 py-1 bg-purple-600/20 border border-purple-500/50 rounded-full text-sm text-purple-300">
            ✨ Pro
          </div>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-3">
          {session?.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs text-gray-400">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### 2.4 Create Main Dashboard Page

Create `app/dashboard/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects');
      const { data } = await res.json();
      setProjects(data.slice(0, 5)); // Show recent 5
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back, {session?.user?.name}!</h1>
        <p className="text-gray-400">Manage your projects and continue building</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/generator">
          <div className="p-6 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 cursor-pointer hover:shadow-lg transition">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold">Create Blueprint</h3>
            <p className="text-sm text-white/80">Generate a new project blueprint</p>
          </div>
        </Link>

        <Link href="/dashboard/projects">
          <div className="p-6 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 cursor-pointer hover:shadow-lg transition">
            <div className="text-3xl mb-2">📁</div>
            <h3 className="font-semibold">All Projects</h3>
            <p className="text-sm text-white/80">View and manage all your projects</p>
          </div>
        </Link>

        <Link href="/dashboard/snippets">
          <div className="p-6 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 cursor-pointer hover:shadow-lg transition">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold">Snippets</h3>
            <p className="text-sm text-white/80">Save and organize code snippets</p>
          </div>
        </Link>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          <Link href="/dashboard/projects" className="text-purple-400 hover:text-purple-300">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading projects...</div>
        ) : projects.length > 0 ? (
          <div className="space-y-2">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition">
                  <h3 className="font-semibold">{project.name}</h3>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                      project.status === 'in-progress' ? 'bg-blue-600/20 text-blue-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            No projects yet. <Link href="/dashboard/generator" className="text-purple-400">Create one now!</Link>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2.5 Create Projects List Page

Create `app/dashboard/projects/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  async function fetchProjects() {
    try {
      const url = new URL('/api/projects', window.location.origin);
      if (filter) {
        url.searchParams.append('status', filter);
      }
      const res = await fetch(url);
      const { data } = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-400">Manage all your development projects</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/generator')}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
        >
          + New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'planning', 'in-progress', 'completed'].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 hover:border-purple-500 transition cursor-pointer h-full">
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{project.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    project.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                    project.status === 'in-progress' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                  <span className="text-gray-500">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No projects found</div>
          <button
            onClick={() => router.push('/dashboard/generator')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            Create Your First Project
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Database migrations run successfully
- [ ] API routes respond correctly
- [ ] Dashboard layout displays
- [ ] Projects CRUD operations work
- [ ] Authentication is enforced
- [ ] RLS policies prevent unauthorized access
- [ ] Activity logging works
- [ ] Responsive design on mobile

---

## Files Created This Week

```
supabase/migrations/
├── [timestamp]_create_projects_table.sql
├── [timestamp]_create_project_phases.sql
├── [timestamp]_create_snippets_table.sql
├── [timestamp]_create_team_collaborations.sql
└── [timestamp]_create_activity_log.sql

app/api/projects/
├── route.ts
└── [id]/route.ts

app/dashboard/
├── layout.tsx
├── page.tsx
└── projects/
    └── page.tsx

components/Hub/
├── DashboardSidebar.tsx
├── DashboardHeader.tsx
└── [More components...]

app/payment/
└── success/
    └── page.tsx (updated)
```

---

## Next Steps

1. **Deploy migrations** to production Supabase
2. **Test API endpoints** thoroughly
3. **Add error handling** and loading states
4. **Implement real-time updates** with WebSocket (Week 3)
5. **Create project detail pages** (Week 2)

This foundation provides a solid base for building out the rest of the Hub!
