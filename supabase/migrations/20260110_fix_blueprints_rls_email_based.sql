-- Fix RLS policies to match by email instead of user_id
-- The blueprints table has mixed user_id formats (numeric and UUID)
-- So we'll use email from auth.users to match against public.users

-- 1. Drop all conflicting policies
DROP POLICY IF EXISTS "Users can view own blueprints" ON blueprints;
DROP POLICY IF EXISTS "blueprints_select_own" ON blueprints;
DROP POLICY IF EXISTS "blueprints_insert_own" ON blueprints;
DROP POLICY IF EXISTS "blueprints_update_own" ON blueprints;
DROP POLICY IF EXISTS "blueprints_delete_own" ON blueprints;

-- 2. Recreate SELECT policy - match by email through public.users
CREATE POLICY "blueprints_select_own"
ON blueprints FOR SELECT
TO authenticated
USING (
  -- Get the authenticated user's email, find their user_id in public.users,
  -- then check if that user_id owns this blueprint
  user_id IN (
    SELECT u.user_id 
    FROM public.users u
    JOIN auth.users au ON u.email = au.email
    WHERE au.id = auth.uid()
  )
);

-- 3. Recreate INSERT policy
CREATE POLICY "blueprints_insert_own"
ON blueprints FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT u.user_id 
    FROM public.users u
    JOIN auth.users au ON u.email = au.email
    WHERE au.id = auth.uid()
  )
);

-- 4. Recreate UPDATE policy
CREATE POLICY "blueprints_update_own"
ON blueprints FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT u.user_id 
    FROM public.users u
    JOIN auth.users au ON u.email = au.email
    WHERE au.id = auth.uid()
  )
);

-- 5. Recreate DELETE policy
CREATE POLICY "blueprints_delete_own"
ON blueprints FOR DELETE
TO authenticated
USING (
  user_id IN (
    SELECT u.user_id 
    FROM public.users u
    JOIN auth.users au ON u.email = au.email
    WHERE au.id = auth.uid()
  )
);

-- 6. Keep service_role policy for admin access
DROP POLICY IF EXISTS "blueprints_service_role" ON blueprints;

CREATE POLICY "blueprints_service_role"
ON blueprints FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Verify the policies
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'blueprints'
ORDER BY policyname;
