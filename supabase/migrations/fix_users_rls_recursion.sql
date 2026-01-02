-- Fix infinite recursion in users table RLS policies
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily to drop and recreate policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Allow user insert via service role" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies without recursion
-- Policy: Users can view their own profile (SELECT)
CREATE POLICY "Users can view their own profile"
ON users
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can update their own profile (UPDATE)
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Allow user insert during signup (INSERT)
CREATE POLICY "Allow user insert during signup"
ON users
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Service role bypass for admin operations
CREATE POLICY "Service role bypass"
ON users
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Verify policies are applied
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
