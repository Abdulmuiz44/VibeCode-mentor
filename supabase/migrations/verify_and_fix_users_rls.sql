-- Verify and definitively disable RLS on public.users table

-- Check the actual state
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users'
ORDER BY schemaname;

-- Explicitly disable RLS on public.users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all policies on public.users
DROP POLICY IF EXISTS "select_own_user" ON public.users;
DROP POLICY IF EXISTS "update_own_user" ON public.users;
DROP POLICY IF EXISTS "insert_own_user" ON public.users;
DROP POLICY IF EXISTS "service_role_all" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user insert during signup" ON public.users;
DROP POLICY IF EXISTS "Service role bypass" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can read own data or admins can read all" ON public.users;
DROP POLICY IF EXISTS "Users can update own data or admins can update all" ON public.users;

-- Final verification
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';
