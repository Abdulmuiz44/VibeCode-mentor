-- TEMPORARY FIX: Disable RLS on users table completely
-- This is a workaround while we diagnose the recursion issue
-- The service role will still be used for sensitive operations

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';
