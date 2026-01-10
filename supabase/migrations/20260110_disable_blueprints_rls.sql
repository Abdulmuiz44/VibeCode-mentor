-- Disable RLS on blueprints table
-- The app uses NextAuth for authentication, not Supabase auth
-- So RLS policies based on auth.uid() don't work
-- Authorization is handled in the NextAuth session callback and code checks

-- Drop all RLS policies on blueprints
DROP POLICY IF EXISTS "blueprints_select_own" ON blueprints;
DROP POLICY IF EXISTS "blueprints_insert_own" ON blueprints;
DROP POLICY IF EXISTS "blueprints_update_own" ON blueprints;
DROP POLICY IF EXISTS "blueprints_delete_own" ON blueprints;
DROP POLICY IF EXISTS "blueprints_service_role" ON blueprints;
DROP POLICY IF EXISTS "Users can view own blueprints" ON blueprints;

-- Disable RLS completely - authorization is handled by NextAuth
ALTER TABLE blueprints DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'blueprints';
