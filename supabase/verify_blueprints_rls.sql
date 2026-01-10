-- Verify RLS policies were created
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'blueprints'
ORDER BY policyname;

-- Check if there are any blueprints in the table
SELECT COUNT(*) as blueprint_count FROM blueprints;

-- List first few blueprints with user info
SELECT id, user_id, vibe, created_at FROM blueprints ORDER BY created_at DESC LIMIT 5;

-- Check users table
SELECT COUNT(*) as user_count FROM users;
