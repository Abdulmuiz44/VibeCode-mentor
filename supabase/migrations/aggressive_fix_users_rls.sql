-- AGGRESSIVE FIX: Completely remove and rebuild users RLS
-- This completely disables RLS and uses service role bypass

-- Step 1: DISABLE RLS entirely on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Allow user insert during signup" ON users;
DROP POLICY IF EXISTS "Service role bypass" ON users;
DROP POLICY IF EXISTS "Users can read own data or admins can read all" ON users;
DROP POLICY IF EXISTS "Users can update own data or admins can update all" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Allow user insert via service role" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Step 3: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create SIMPLE, NON-RECURSIVE policies
-- Policy 1: Everyone can select (read) their own profile
CREATE POLICY "select_own_user"
ON users
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy 2: Everyone can update their own profile
CREATE POLICY "update_own_user"
ON users
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Policy 3: Anyone can insert their own user record (for signup)
CREATE POLICY "insert_own_user"
ON users
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Policy 4: Service role has complete bypass
CREATE POLICY "service_role_all"
ON users
FOR ALL
USING (auth.role() = 'service_role');

-- Verify the final state
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;
