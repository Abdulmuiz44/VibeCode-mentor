-- Create table for tracking agent generation steps
CREATE TABLE IF NOT EXISTS project_generation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, in-progress, completed, failed
  details TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by project
CREATE INDEX IF NOT EXISTS idx_project_generation_steps_project_id ON project_generation_steps(project_id);
