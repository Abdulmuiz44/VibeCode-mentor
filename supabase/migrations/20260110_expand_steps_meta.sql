-- Add type and metadata columns to generation steps
ALTER TABLE project_generation_steps 
ADD COLUMN IF NOT EXISTS step_type TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;
