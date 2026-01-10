-- Migration to align 'projects' table with ProjectDatabase expectations
-- This adds missing columns and updates status constraints

-- 1. Add missing columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_files INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_repo_id BIGINT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Backfill user_id from owner_id (for hub schema compatibility)
UPDATE projects SET user_id = owner_id WHERE user_id IS NULL;

-- 3. Update status check constraint
-- First drop existing if it exists (names might vary, but usually projects_status_check)
DO $$ 
BEGIN 
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
EXCEPTION 
    WHEN others THEN NULL; 
END $$;

ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'active', 'archived', 'completed', 'generating', 'failed'));

-- 4. Add index for user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Optional: Sync tech_stack and technologies if one is updated? 
-- For now we just ensure 'technologies' exists as that's what the code uses.
