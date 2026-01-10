-- Diagnose the user_id mismatch issue

-- 1. Check what format user_id values are in users table
SELECT user_id, email FROM public.users LIMIT 5;

-- 2. Check what format user_id values are in blueprints table
SELECT DISTINCT user_id FROM blueprints LIMIT 5;

-- 3. Check if there's ANY overlap
SELECT COUNT(*) as matching_users
FROM public.users
WHERE user_id IN (SELECT DISTINCT user_id FROM blueprints);

-- 4. If no overlap, check the auth.users table (Supabase internal)
-- This shows what auth.uid() will actually return
SELECT id, email FROM auth.users LIMIT 5;

-- 5. See if Supabase auth IDs match our users table
SELECT COUNT(*) as auth_matches_users
FROM auth.users au
WHERE au.id::text IN (SELECT user_id FROM public.users);
