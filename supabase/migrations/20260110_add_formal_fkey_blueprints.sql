-- Formally establish the foreign key relationship to fix PGRST200
-- This allows PostgREST to understand the relationship for nested selects

DO $$
BEGIN
    -- 1. Ensure project_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'project_id') THEN
        ALTER TABLE blueprints ADD COLUMN project_id UUID;
    END IF;

    -- 2. Drop existing constraint if it exists (to avoid duplicate errors)
    ALTER TABLE blueprints DROP CONSTRAINT IF EXISTS blueprints_project_id_fkey;

    -- 3. Add the foreign key constraint
    ALTER TABLE blueprints
    ADD CONSTRAINT blueprints_project_id_fkey
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE;

END $$;

-- Verify schema cache refresh (PostgREST usually auto-refreshes on DDL)
-- But we can also add a comment to force a reload in some environments
COMMENT ON TABLE blueprints IS 'Stores project blueprints with formal relationship to projects table';
