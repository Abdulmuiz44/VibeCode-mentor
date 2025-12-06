-- CRITICAL FIX: Grant Pro Access to abdulmuizproject@gmail.com
-- Run this ENTIRE script in Supabase SQL Editor

-- ============================================
-- STEP 1: Add is_pro column if it doesn't exist
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_pro'
    ) THEN
        ALTER TABLE users ADD COLUMN is_pro BOOLEAN DEFAULT false;
        RAISE NOTICE 'Column is_pro added successfully';
    ELSE
        RAISE NOTICE 'Column is_pro already exists';
    END IF;
END $$;

-- ============================================
-- STEP 2: Grant Pro access to the user
-- ============================================
UPDATE users 
SET is_pro = true, updated_at = NOW()
WHERE email = 'abdulmuizproject@gmail.com';

-- ============================================
-- STEP 3: Verify the update (MUST SHOW is_pro = true)
-- ============================================
SELECT 
    user_id, 
    email, 
    is_pro, 
    created_at,
    updated_at
FROM users 
WHERE email = 'abdulmuizproject@gmail.com';

-- ============================================
-- EXPECTED RESULT: Should show one row with is_pro = true
-- If you see 0 rows, the user doesn't exist in the users table
-- ============================================
