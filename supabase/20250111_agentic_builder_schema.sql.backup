-- Agentic Builder Project Schema
-- Tables to support autonomous full-stack application generation

-- Main agentic projects table
CREATE TABLE IF NOT EXISTS agentic_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT,
  
  -- Blueprint and Code
  blueprint JSONB,                -- Technical specifications from agent
  codebase JSONB,                 -- Generated code files structure
  
  -- Execution Status
  status TEXT NOT NULL DEFAULT 'planning' CHECK (
    status IN ('planning', 'building', 'testing', 'deploying', 'deployed', 'failed', 'paused')
  ),
  current_phase TEXT,             -- Current execution phase
  progress_percentage INTEGER DEFAULT 0,
  
  -- External Integration
  github_repo_url TEXT UNIQUE,    -- GitHub repository URL
  github_branch TEXT DEFAULT 'main',
  deployed_url TEXT UNIQUE,       -- Live deployment URL
  docker_container_id TEXT,       -- Running Docker container
  
  -- Logs and Results
  build_logs TEXT,                -- Complete build output
  test_results JSONB,             -- Test execution results
  deployment_logs TEXT,           -- Deployment output
  
  -- Error Handling
  error_message TEXT,
  error_phase TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  deployment_date TIMESTAMP WITH TIME ZONE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_agentic_projects_user_id ON agentic_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_agentic_projects_status ON agentic_projects(status);
CREATE INDEX IF NOT EXISTS idx_agentic_projects_created_at ON agentic_projects(created_at DESC);

-- Agent execution steps (track each phase execution)
CREATE TABLE IF NOT EXISTS agent_execution_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES agentic_projects(id) ON DELETE CASCADE,
  
  step_name TEXT NOT NULL CHECK (
    step_name IN ('blueprint_generation', 'scaffolding', 'build', 'test', 'deploy', 'rollback')
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'skipped', 'manual_review')
  ),
  
  -- Step execution details
  input JSONB,                    -- Input to this step
  output JSONB,                   -- Output/results from this step
  error_message TEXT,
  error_details JSONB,
  
  -- Duration tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Logs
  logs TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_execution_steps_project_id ON agent_execution_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_execution_steps_status ON agent_execution_steps(status);

-- Guardrails Configuration (security & resource limits)
CREATE TABLE IF NOT EXISTS guardrails_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES agentic_projects(id) ON DELETE CASCADE,
  
  -- Execution Limits
  max_execution_time_minutes INTEGER DEFAULT 30,
  max_disk_usage_mb INTEGER DEFAULT 5000,
  max_memory_mb INTEGER DEFAULT 4096,
  max_api_calls INTEGER DEFAULT 1000,
  
  -- Security
  allowed_npm_packages TEXT[],    -- Package whitelist (empty = all allowed with scanning)
  allowed_env_vars TEXT[],        -- Environment variables that can be used
  disallowed_npm_packages TEXT[], -- Hard blocked packages
  network_access_allowed BOOLEAN DEFAULT FALSE,
  
  -- Controls
  require_manual_approval BOOLEAN DEFAULT FALSE,
  require_code_review BOOLEAN DEFAULT FALSE,
  enable_auto_rollback BOOLEAN DEFAULT TRUE,
  
  -- Notifications
  notify_on_completion BOOLEAN DEFAULT TRUE,
  notify_on_failure BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guardrails_project_id ON guardrails_config(project_id);

-- Agent action audit log (compliance & debugging)
CREATE TABLE IF NOT EXISTS agent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES agentic_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL,           -- What the agent did
  action_type TEXT NOT NULL CHECK (
    action_type IN ('code_generation', 'file_creation', 'file_modification', 'file_deletion', 
                    'command_execution', 'deployment', 'security_check', 'resource_limit_hit')
  ),
  
  details JSONB,                  -- Action-specific details
  result TEXT,                    -- Success or error message
  impact_assessment JSONB,        -- Resources used, etc.
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_project_id ON agent_audit_log(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON agent_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON agent_audit_log(action_type);

-- Enable RLS
ALTER TABLE agentic_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardrails_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agentic_projects
CREATE POLICY "Users can view own agentic projects"
  ON agentic_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agentic projects"
  ON agentic_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agentic projects"
  ON agentic_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agentic projects"
  ON agentic_projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for agent_execution_steps
CREATE POLICY "Users can view execution steps of own projects"
  ON agent_execution_steps FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM agentic_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert execution steps for own projects"
  ON agent_execution_steps FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM agentic_projects WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for guardrails_config
CREATE POLICY "Users can view guardrails of own projects"
  ON guardrails_config FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM agentic_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage guardrails of own projects"
  ON guardrails_config FOR ALL
  USING (
    project_id IN (
      SELECT id FROM agentic_projects WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for agent_audit_log
CREATE POLICY "Users can view audit logs of own projects"
  ON agent_audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agentic_projects_timestamp
  BEFORE UPDATE ON agentic_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_execution_steps_timestamp
  BEFORE UPDATE ON agent_execution_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_guardrails_timestamp
  BEFORE UPDATE ON guardrails_config
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
