# Supabase Database Setup for NextAuth

## Step 1: Create the Users Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Users can read their own data
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can update their own data
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Service role can insert new users (for NextAuth)
-- Note: This will be done via the Supabase anon key from NextAuth callbacks
```

## Step 2: Configure Environment Variables

Copy these variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_generated_secret_here
AUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Step 3: Generate AUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

## Step 4: Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

## Step 5: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key
5. Add them to your `.env.local`

## Step 6: Deploy to Vercel

Add all environment variables to your Vercel project:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the variables from your `.env.local`
3. Make sure to update `NEXTAUTH_URL` to your production URL

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Click "Sign in with Google"
3. Complete the Google authentication flow
4. Check your Supabase users table to verify the user was created

## Notes

- The user ID from NextAuth is used as the primary key in Supabase
- The `updated_at` timestamp is updated on each login
- New users are automatically created on first sign-in
- Profile images are stored as URLs from Google

## Troubleshooting

**Issue: "Failed to store user profile in Supabase"**
- Check that your Supabase URL and anon key are correct
- Verify that the users table exists
- Make sure RLS policies are set correctly

**Issue: "Sign in failed"**
- Verify Google OAuth credentials
- Check that redirect URIs are configured correctly
- Ensure NEXTAUTH_SECRET is set

**Issue: "Session not found"**
- Clear browser cookies
- Restart the development server
- Check that NEXTAUTH_URL matches your current URL
