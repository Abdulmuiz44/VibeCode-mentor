-- Generated Projects Table
-- Stores all user-generated projects and their status

CREATE TABLE IF NOT EXISTS generated_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_slug TEXT NOT NULL,
  description TEXT,
  blueprint JSONB NOT NULL,
  generated_files JSONB NOT NULL,
  
  -- Generation Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  current_step TEXT,
  error_message TEXT,
  
  -- GitHub Integration
  github_url TEXT UNIQUE,
  github_repo_id BIGINT UNIQUE,
  
  -- Metadata
  total_files INTEGER DEFAULT 0,
  technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
  api_endpoints INTEGER DEFAULT 0,
  components INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generated_projects_user_id ON generated_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_projects_status ON generated_projects(status);
CREATE INDEX IF NOT EXISTS idx_generated_projects_created_at ON generated_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_projects_slug ON generated_projects(project_slug);

-- Enable RLS
ALTER TABLE generated_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own generated projects"
  ON generated_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated projects"
  ON generated_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated projects"
  ON generated_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated projects"
  ON generated_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Table for tracking generation steps
CREATE TABLE IF NOT EXISTS project_generation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES generated_projects(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'failed')),
  details TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_generation_steps_project_id ON project_generation_steps(project_id);

-- GitHub Tokens Table (encrypted)
CREATE TABLE IF NOT EXISTS github_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  github_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE github_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own GitHub tokens"
  ON github_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own GitHub tokens"
  ON github_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GitHub tokens"
  ON github_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GitHub tokens"
  ON github_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_projects_updated_at
  BEFORE UPDATE ON generated_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_tokens_updated_at
  BEFORE UPDATE ON github_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
