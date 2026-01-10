-- Fix blueprint RLS - user_id mismatch issue
-- The blueprints table stores numeric user IDs but auth.uid() returns UUIDs
-- Solution: Check against the users table instead

-- 1. Drop the old conflicting policy with public role
DROP POLICY IF EXISTS "Users can view own blueprints" ON blueprints;

-- 2. Drop and recreate SELECT policy to check users table
DROP POLICY IF EXISTS "blueprints_select_own" ON blueprints;

CREATE POLICY "blueprints_select_own"
ON blueprints FOR SELECT
TO authenticated
USING (
  -- Check if the authenticated user's email matches a user in our users table
  -- and that user owns this blueprint
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid()::text = users.user_id
    AND users.user_id = blueprints.user_id
  )
);

-- 3. Also update INSERT policy to be more flexible
DROP POLICY IF EXISTS "blueprints_insert_own" ON blueprints;

CREATE POLICY "blueprints_insert_own"
ON blueprints FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow insert if we can find a matching user
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid()::text = users.user_id
    AND users.user_id = blueprints.user_id
  )
);

-- 4. Verify what users exist in the users table
SELECT user_id, email, created_at FROM public.users LIMIT 5;

-- 5. Check if auth.uid() values match any user_id in blueprints
-- This will help us understand the mismatch
SELECT DISTINCT bp.user_id FROM blueprints bp
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.user_id = bp.user_id
)
LIMIT 10;
