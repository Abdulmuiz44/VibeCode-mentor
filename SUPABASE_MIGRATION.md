# Supabase Migration Guide for VibeCode Mentor

This guide will help you migrate from Firebase to Supabase for authentication and data storage.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Your Firebase project credentials (for reference)

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter a project name (e.g., "vibecode-mentor")
4. Set a strong database password (save this!)
5. Choose a region close to your users
6. Click "Create new project"

## Step 2: Set Up Database Schema

1. Navigate to the SQL Editor in your Supabase dashboard
2. Open the `supabase-schema.sql` file in this repository
3. Copy the entire SQL content
4. Paste it into the SQL Editor
5. Click "Run" to execute the SQL

This will create:
- `users` table for user profiles and Pro status
- `blueprints` table for saved blueprints
- `custom_prompts` table for Pro users' custom prompts
- Row Level Security (RLS) policies for data protection
- Indexes for better performance

## Step 3: Configure Google OAuth

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click the toggle to enable it
3. You'll need:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console

### Getting Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create a new one)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**
8. Paste them into Supabase Google provider settings
9. Click **Save**

## Step 4: Update Environment Variables

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Create or update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Deploy and Test

1. Install dependencies (already done if you've built locally):
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Run locally to test:
   ```bash
   npm run dev
   ```

4. Test the following:
   - Click "Sign in with Google"
   - You should be redirected to Google sign-in
   - After signing in, you should be redirected back to the app
   - Your email and profile should be stored in Supabase

5. Deploy to Vercel:
   - Push changes to your repository
   - Vercel will automatically deploy
   - Add environment variables in Vercel dashboard:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 6: Verify Data Storage

After signing in, check your Supabase dashboard:

1. Go to **Table Editor**
2. Check the `users` table - you should see your user record
3. Create a blueprint in the app
4. Check the `blueprints` table - your blueprint should be saved
5. If you're a Pro user, create a custom prompt
6. Check the `custom_prompts` table - your prompt should be saved

## Database Structure

### Users Table
- `id` (UUID): User's unique ID (from auth.users)
- `email` (TEXT): User's email address
- `is_pro` (BOOLEAN): Pro subscription status
- `created_at` (TIMESTAMP): When the user was created
- `updated_at` (TIMESTAMP): Last update timestamp

### Blueprints Table
- `id` (TEXT): Composite ID (user_id_blueprint_id)
- `user_id` (UUID): Foreign key to auth.users
- `blueprint_id` (BIGINT): Blueprint's numeric ID
- `vibe` (TEXT): The project idea/vibe
- `blueprint` (TEXT): The full blueprint content
- `timestamp` (BIGINT): Creation timestamp (milliseconds)
- `created_at` (TIMESTAMP): Database creation timestamp

### Custom Prompts Table
- `id` (TEXT): Composite ID (user_id_prompt_id)
- `user_id` (UUID): Foreign key to auth.users
- `prompt_id` (TEXT): Prompt's unique ID
- `title` (TEXT): Short description of the prompt
- `prompt` (TEXT): Full prompt text
- `timestamp` (BIGINT): Creation timestamp (milliseconds)
- `created_at` (TIMESTAMP): Database creation timestamp

## Security

The database uses Row Level Security (RLS) to ensure:
- Users can only access their own data
- Users cannot view or modify other users' data
- All operations are authenticated through Supabase Auth

## Troubleshooting

### Sign-in redirect not working
1. Check that your Google OAuth redirect URI matches exactly:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
2. Verify that the Client ID and Client Secret are correct
3. Check browser console for errors

### Data not saving
1. Verify environment variables are set correctly
2. Check Supabase dashboard logs (**Logs** section)
3. Ensure RLS policies are enabled and correct
4. Check browser console for errors

### Build errors
1. Make sure all dependencies are installed: `npm install`
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`

## Migration from Firebase (Optional)

If you have existing data in Firebase that you want to migrate to Supabase:

1. Export your Firebase data
2. Transform it to match Supabase schema
3. Use Supabase's bulk insert API to import data

Contact support if you need help with data migration.

## Support

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/Abdulmuiz44/VibeCode-mentor/issues

---

**Note**: Firebase authentication is now deprecated in this application. All new authentication goes through Supabase.
