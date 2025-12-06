-- Migration: Add is_pro column to users table
-- Run this in Supabase SQL Editor

-- Add the is_pro column with default value false
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_is_pro ON users(is_pro);

-- Grant Pro access to abdulmuizproject@gmail.com
UPDATE users 
SET is_pro = true, 
    updated_at = NOW()
WHERE email = 'abdulmuizproject@gmail.com';

-- Verify the update
SELECT user_id, email, is_pro, updated_at 
FROM users 
WHERE email = 'abdulmuizproject@gmail.com';
