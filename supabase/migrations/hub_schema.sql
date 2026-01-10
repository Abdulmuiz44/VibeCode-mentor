-- VibeCode Mentor Hub Schema
-- Run this migration to create the foundational tables for the Hub transformation

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    description TEXT,
    vibe TEXT NOT NULL,  -- Original project idea/vibe
    tech_stack TEXT[] DEFAULT '{}',  -- Array of technologies
    
    -- Status & Metadata
    status TEXT DEFAULT 'draft'::text CHECK (status IN ('draft', 'active', 'archived', 'completed')),
    blueprint_id UUID,  -- Reference to generated blueprint
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Sharing & Visibility
    is_public BOOLEAN DEFAULT false,
    visibility TEXT DEFAULT 'private'::text CHECK (visibility IN ('private', 'team', 'public')),
    
    -- Stats
    member_count INTEGER DEFAULT 1,
    file_count INTEGER DEFAULT 0,
    
    -- SEO & Discovery
    slug TEXT UNIQUE,
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    featured_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = true;

-- 2. PROJECT MEMBERS TABLE
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role & Permissions
    role TEXT NOT NULL DEFAULT 'member'::text CHECK (role IN ('owner', 'editor', 'viewer', 'commenter')),
    
    -- Status
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID REFERENCES auth.users(id),
    
    -- Last activity
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);

-- 3. PROJECT FILES TABLE
CREATE TABLE IF NOT EXISTS project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- File Info
    name TEXT NOT NULL,
    path TEXT NOT NULL,  -- Relative path in project
    content TEXT,
    language TEXT,  -- Programming language
    size INTEGER DEFAULT 0,
    
    -- Metadata
    file_type TEXT,  -- 'directory', 'file', 'template'
    is_template BOOLEAN DEFAULT false,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_file_id UUID REFERENCES project_files(id),
    
    -- Ownership
    created_by UUID REFERENCES auth.users(id),
    last_modified_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- GitHub
    github_sha TEXT,
    github_pushed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(project_id, path)
);

CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_path ON project_files(path);
CREATE INDEX idx_project_files_language ON project_files(language);
CREATE INDEX idx_project_files_created_at ON project_files(created_at DESC);

-- 4. SNIPPETS TABLE
CREATE TABLE IF NOT EXISTS snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    
    -- Categorization
    category TEXT,  -- 'auth', 'database', 'api', 'ui', etc.
    tags TEXT[] DEFAULT '{}',
    
    -- Visibility
    is_public BOOLEAN DEFAULT false,
    visibility TEXT DEFAULT 'private'::text CHECK (visibility IN ('private', 'team', 'public')),
    
    -- Stats
    likes INTEGER DEFAULT 0,
    uses INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Metadata
    version TEXT DEFAULT '1.0.0',
    framework TEXT,  -- 'react', 'vue', 'svelte', 'node', etc.
    dependencies TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- SEO
    slug TEXT UNIQUE,
    featured BOOLEAN DEFAULT false
);

CREATE INDEX idx_snippets_owner_id ON snippets(owner_id);
CREATE INDEX idx_snippets_language ON snippets(language);
CREATE INDEX idx_snippets_category ON snippets(category);
CREATE INDEX idx_snippets_visibility ON snippets(visibility);
CREATE INDEX idx_snippets_created_at ON snippets(created_at DESC);
CREATE INDEX idx_snippets_featured ON snippets(featured) WHERE featured = true;

-- 5. PROJECT ACTIVITY TABLE (Audit Log)
CREATE TABLE IF NOT EXISTS project_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    -- Activity Type
    action TEXT NOT NULL,  -- 'created', 'updated', 'file_added', 'member_joined', 'published', etc.
    entity_type TEXT,  -- 'project', 'file', 'member', 'comment'
    entity_id TEXT,
    
    -- Details
    details JSONB,
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- IP & User Agent (optional)
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_project_activity_project_id ON project_activity(project_id);
CREATE INDEX idx_project_activity_user_id ON project_activity(user_id);
CREATE INDEX idx_project_activity_action ON project_activity(action);
CREATE INDEX idx_project_activity_created_at ON project_activity(created_at DESC);

-- 6. PROJECT TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Info
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    
    -- Template Data
    structure JSONB NOT NULL,  -- File structure
    files JSONB NOT NULL,      -- File content templates with variables
    
    -- Metadata
    category TEXT,  -- 'rest-api', 'saas', 'cli', 'chrome-extension', etc.
    icon TEXT,
    difficulty TEXT DEFAULT 'intermediate'::text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    
    -- Tags & Discovery
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    
    -- Tech Stack
    tech_stack TEXT[] DEFAULT '{}',
    dependencies JSONB,  -- npm packages
    
    -- Stats
    used_count INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON project_templates(category);
CREATE INDEX idx_templates_featured ON project_templates(featured) WHERE featured = true;
CREATE INDEX idx_templates_created_at ON project_templates(created_at DESC);

-- 7. COLLABORATIONS TABLE (Real-time)
CREATE TABLE IF NOT EXISTS project_collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Presence
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Current Focus
    focused_file_id UUID REFERENCES project_files(id),
    cursor_position INTEGER,
    
    -- Timestamp
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_collaborations_project_id ON project_collaborations(project_id);
CREATE INDEX idx_collaborations_user_id ON project_collaborations(user_id);

-- 8. GITHUB INTEGRATIONS TABLE
CREATE TABLE IF NOT EXISTS github_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- OAuth
    github_user_id TEXT NOT NULL,
    github_username TEXT NOT NULL,
    access_token TEXT NOT NULL,
    
    -- Repository
    repo_owner TEXT,
    repo_name TEXT,
    repo_url TEXT,
    
    -- Status
    is_connected BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, github_user_id)
);

CREATE INDEX idx_github_integrations_user_id ON github_integrations(user_id);
CREATE INDEX idx_github_integrations_project_id ON github_integrations(project_id);

-- RLS POLICIES
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;

-- Projects RLS
CREATE POLICY "users_can_view_own_projects"
    ON projects FOR SELECT
    USING (owner_id = auth.uid() OR is_public = true OR id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "users_can_create_projects"
    ON projects FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "users_can_update_own_projects"
    ON projects FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "users_can_delete_own_projects"
    ON projects FOR DELETE
    USING (owner_id = auth.uid());

-- Project Members RLS
CREATE POLICY "users_can_view_project_members"
    ON project_members FOR SELECT
    USING (user_id = auth.uid() OR project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid() OR is_public = true
    ));

-- Snippets RLS
CREATE POLICY "users_can_view_public_snippets"
    ON snippets FOR SELECT
    USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "users_can_create_snippets"
    ON snippets FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "users_can_update_own_snippets"
    ON snippets FOR UPDATE
    USING (owner_id = auth.uid());

-- Timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_files_updated_at BEFORE UPDATE ON project_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snippets_updated_at BEFORE UPDATE ON snippets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_integrations_updated_at BEFORE UPDATE ON github_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- COMMENTS for documentation
COMMENT ON TABLE projects IS 'Main project entity - stores project blueprints and metadata';
COMMENT ON TABLE project_members IS 'Team members and their roles in projects';
COMMENT ON TABLE project_files IS 'Generated code files and project structure';
COMMENT ON TABLE snippets IS 'Reusable code blocks for the community library';
COMMENT ON TABLE project_activity IS 'Audit log for project changes and activities';
COMMENT ON TABLE project_templates IS 'Code generation templates for common project types';
COMMENT ON TABLE project_collaborations IS 'Real-time collaboration presence and state';
COMMENT ON TABLE github_integrations IS 'GitHub OAuth integrations for code pushing';
