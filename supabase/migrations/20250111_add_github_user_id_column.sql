-- Add github_user_id column to github_tokens table
ALTER TABLE github_tokens
ADD COLUMN IF NOT EXISTS github_user_id BIGINT;

-- Create index for github_user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_github_tokens_github_user_id ON github_tokens(github_user_id);
