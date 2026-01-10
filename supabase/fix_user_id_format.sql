-- Check which auth.users correspond to which format in public.users

-- 1. Show all auth.users
SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- 2. Show all public.users with their ID format
SELECT user_id, email,
  CASE 
    WHEN user_id ~ '^\d+$' THEN 'NUMERIC'
    WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUID'
    ELSE 'UNKNOWN'
  END as id_format
FROM public.users
ORDER BY user_id;

-- 3. Count by format
SELECT 
  CASE 
    WHEN user_id ~ '^\d+$' THEN 'NUMERIC'
    WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUID'
    ELSE 'UNKNOWN'
  END as id_format,
  COUNT(*) as count
FROM public.users
GROUP BY id_format;
