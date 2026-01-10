-- Final fix for blueprints table RLS
-- This migration ensures proper RLS policies for blueprint queries

-- 1. Ensure RLS is enabled
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing conflicting policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own blueprints" ON blueprints;
    DROP POLICY IF EXISTS "Users can insert their own blueprints" ON blueprints;
    DROP POLICY IF EXISTS "Users can update their own blueprints" ON blueprints;
    DROP POLICY IF EXISTS "Users can delete their own blueprints" ON blueprints;
    DROP POLICY IF EXISTS "Service role has full access" ON blueprints;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 3. Create simple, reliable RLS policies
-- SELECT policy - allow users to view their own blueprints
CREATE POLICY "blueprints_select_own"
ON blueprints FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- INSERT policy - allow users to create blueprints
CREATE POLICY "blueprints_insert_own"
ON blueprints FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- UPDATE policy - allow users to update their own blueprints
CREATE POLICY "blueprints_update_own"
ON blueprints FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

-- DELETE policy - allow users to delete their own blueprints
CREATE POLICY "blueprints_delete_own"
ON blueprints FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Admin/Service role policy - full access
CREATE POLICY "blueprints_service_role"
ON blueprints FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Ensure indices for performance
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);

-- 5. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'blueprints'
ORDER BY ordinal_position;
