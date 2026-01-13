-- Sandboxes table for tracking cloud execution environments
-- Migration: 20260113_create_sandboxes_table

CREATE TABLE IF NOT EXISTS sandboxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'e2b',
    sandbox_id TEXT,                              -- Provider's internal ID
    preview_url TEXT,
    status TEXT DEFAULT 'creating' CHECK (status IN ('creating', 'ready', 'running', 'stopped', 'error', 'expired')),
    logs JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes'),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build logs table for detailed execution tracking
CREATE TABLE IF NOT EXISTS build_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sandbox_id UUID REFERENCES sandboxes(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    level TEXT DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error', 'debug')),
    message TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Deployments table for tracking production deployments
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'vercel' CHECK (provider IN ('vercel', 'netlify', 'railway')),
    deployment_id TEXT,                           -- Provider's deployment ID
    url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'ready', 'failed', 'cancelled')),
    branch TEXT DEFAULT 'main',
    commit_sha TEXT,
    error_message TEXT,
    deployed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sandboxes_project_id ON sandboxes(project_id);
CREATE INDEX IF NOT EXISTS idx_sandboxes_status ON sandboxes(status);
CREATE INDEX IF NOT EXISTS idx_build_logs_project_id ON build_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_build_logs_sandbox_id ON build_logs(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);

-- RLS Policies
ALTER TABLE sandboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Sandboxes policies
CREATE POLICY "Users can view their own sandboxes"
    ON sandboxes FOR SELECT
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can create sandboxes for their projects"
    ON sandboxes FOR INSERT
    WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own sandboxes"
    ON sandboxes FOR UPDATE
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Build logs policies
CREATE POLICY "Users can view their own build logs"
    ON build_logs FOR SELECT
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can create build logs for their projects"
    ON build_logs FOR INSERT
    WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Deployments policies
CREATE POLICY "Users can view their own deployments"
    ON deployments FOR SELECT
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can create deployments for their projects"
    ON deployments FOR INSERT
    WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own deployments"
    ON deployments FOR UPDATE
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Service role bypass for API operations
CREATE POLICY "Service role has full access to sandboxes"
    ON sandboxes FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to build_logs"
    ON build_logs FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to deployments"
    ON deployments FOR ALL
    USING (auth.role() = 'service_role');
