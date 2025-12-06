-- COMPREHENSIVE FIX: Grant Pro Access to abdulmuizproject@gmail.com
-- Run ALL of this in Supabase SQL Editor

-- Step 1: Ensure is_pro column exists with default false
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_pro'
    ) THEN
        ALTER TABLE users ADD COLUMN is_pro BOOLEAN DEFAULT false;
        CREATE INDEX idx_users_is_pro ON users(is_pro);
    END IF;
END $$;

-- Step 2: Grant Pro access to abdulmuizproject@gmail.com
-- This works whether user_id matches email or is a UUID
UPDATE users 
SET is_pro = true, updated_at = NOW()
WHERE email = 'abdulmuizproject@gmail.com';

-- Step 3: Verify the update worked
SELECT user_id, email, is_pro, updated_at, created_at
FROM users 
WHERE email = 'abdulmuizproject@gmail.com';

-- Step 4: If no rows were updated, user might not exist in users table yet
-- Check if user exists in auth.users
SELECT id, email, created_at
FROM auth.users
WHERE email = 'abdulmuizproject@gmail.com';

-- Step 5: If user exists in auth but not in public.users, create profile
INSERT INTO users (user_id, email, is_pro, created_at, updated_at)
SELECT 
    id::text,
    email,
    true,
    NOW(),
    NOW()
FROM auth.users
WHERE email = 'abdulmuizproject@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'abdulmuizproject@gmail.com'
);

-- Step 6: Final verification - user should now have Pro
SELECT user_id, email, name, is_pro, created_at, updated_at
FROM users 
WHERE email = 'abdulmuizproject@gmail.com';
