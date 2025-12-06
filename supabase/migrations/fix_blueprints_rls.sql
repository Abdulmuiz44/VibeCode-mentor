-- Fix blueprints table RLS policies
-- Run this in Supabase SQL Editor

-- Enable RLS on blueprints table
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own blueprints" ON blueprints;
DROP POLICY IF EXISTS "Users can insert their own blueprints" ON blueprints;
DROP POLICY IF EXISTS "Users can delete their own blueprints" ON blueprints;
DROP POLICY IF EXISTS "Service role has full access" ON blueprints;

-- Policy: Users can view their own blueprints
CREATE POLICY "Users can view their own blueprints"
ON blueprints
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own blueprints  
CREATE POLICY "Users can insert their own blueprints"
ON blueprints
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can delete their own blueprints
CREATE POLICY "Users can delete their own blueprints"
ON blueprints
FOR DELETE
USING (auth.uid()::text = user_id);

-- Policy: Service role bypass (for admin operations)
CREATE POLICY "Service role has full access"
ON blueprints
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Verify policies are applied
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'blueprints';
