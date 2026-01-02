-- Add admin-related fields to users table
-- This migration adds support for admin users with full access to the platform

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_unlimited_generations boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_unlimited_exports boolean DEFAULT false;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);

-- Add comment to is_admin column
COMMENT ON COLUMN public.users.is_admin IS 'Whether this user has admin privileges and full access to the platform';
COMMENT ON COLUMN public.users.has_unlimited_generations IS 'Whether this user has unlimited blueprint generation requests';
COMMENT ON COLUMN public.users.has_unlimited_exports IS 'Whether this user has unlimited export operations';

-- Update RLS policies for admin access
-- Admin users can access all data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

CREATE POLICY "Users can read own data or admins can read all" ON public.users
  FOR SELECT
  USING (auth.uid()::text = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE user_id = auth.uid()::text AND is_admin = true
  ));

CREATE POLICY "Users can update own data or admins can update all" ON public.users
  FOR UPDATE
  USING (auth.uid()::text = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE user_id = auth.uid()::text AND is_admin = true
  ))
  WITH CHECK (auth.uid()::text = user_id OR EXISTS (
    SELECT 1 FROM public.users WHERE user_id = auth.uid()::text AND is_admin = true
  ));

-- Admins can insert users (for testing/management)
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users WHERE user_id = auth.uid()::text AND is_admin = true
  ));
