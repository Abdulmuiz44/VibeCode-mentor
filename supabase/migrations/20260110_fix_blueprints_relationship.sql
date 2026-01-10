-- Fix missing relationship between projects and blueprints
-- This ensures PostgREST can join these tables correctly

-- First, ensure the blueprints table has a project_id column if it doesn't already
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'project_id') THEN
        ALTER TABLE blueprints ADD COLUMN project_id UUID;
    END IF;
END $$;

-- Add or update the foreign key constraint
ALTER TABLE blueprints 
DROP CONSTRAINT IF EXISTS blueprints_project_id_fkey,
ADD CONSTRAINT blueprints_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES projects(id) 
ON DELETE CASCADE;

-- Also ensure project_idea exists for history
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'project_idea') THEN
        ALTER TABLE blueprints ADD COLUMN project_idea TEXT;
    END IF;
END $$;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blueprints_project_id ON blueprints(project_id);
