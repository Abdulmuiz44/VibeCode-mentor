-- Fix missing columns in blueprints table and update RLS
-- This resolve the "Supabase save error" when saving blueprints

-- 1. Add missing columns with safety checks
DO $$
BEGIN
    -- Add project_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'project_id') THEN
        ALTER TABLE blueprints ADD COLUMN project_id UUID;
    END IF;

    -- Add user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'user_id') THEN
        ALTER TABLE blueprints ADD COLUMN user_id TEXT;
    END IF;

    -- Add vibe if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'vibe') THEN
        ALTER TABLE blueprints ADD COLUMN vibe TEXT;
    END IF;

    -- Ensure project_idea exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blueprints' AND column_name = 'project_idea') THEN
        ALTER TABLE blueprints ADD COLUMN project_idea TEXT;
    END IF;
END $$;

-- 2. Update RLS policies to be robust
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

-- Drop all potentially conflicting policies
DROP POLICY IF EXISTS "Users can view their own blueprints" ON blueprints;
DROP POLICY IF EXISTS "Users can insert their own blueprints" ON blueprints;
DROP POLICY IF EXISTS "Users can update their own blueprints" ON blueprints;
DROP POLICY IF EXISTS "Users can delete their own blueprints" ON blueprints;
DROP POLICY IF EXISTS "Service role has full access" ON blueprints;

-- Create policies using text-based user ID comparison
CREATE POLICY "Users can view their own blueprints"
ON blueprints FOR SELECT
USING (auth.uid()::text = user_id OR project_id IN (
    SELECT id FROM projects WHERE owner_id = auth.uid()::text
));

CREATE POLICY "Users can insert their own blueprints"
ON blueprints FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own blueprints"
ON blueprints FOR UPDATE
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own blueprints"
ON blueprints FOR DELETE
USING (auth.uid()::text = user_id);

CREATE POLICY "Service role has full access"
ON blueprints FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_vibe ON blueprints(vibe);
