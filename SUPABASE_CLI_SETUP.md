# Supabase CLI Setup Instructions

## 1. Install CLI (Manual)
1. Download from: https://github.com/supabase/cli/releases/latest
2. Get `supabase_windows_amd64.exe`
3. Rename to `supabase.exe`
4. Add to PATH or keep in project folder

## 2. Login with Access Token
```bash
# Get your access token from Supabase Dashboard
# Dashboard → Settings → API → service_role (NOT the anon key!)

supabase login
# When prompted, enter your access token

# Alternative: Set token directly
supabase login --token "your_service_role_key_here"
```

## 3. Link to Project
```bash
# Link to your existing project
supabase link --project-ref wpqqhnmhpvgkrgyudvwb

# Or start with project reference
supabase start --workdir . --project-ref wpqqhnmhpvgkrgyudvwb
```

## 4. Verify Connection
```bash
# Test connection
supabase db remote changes

# Check status
supabase status
```

## 5. Common Commands
```bash
# Push migrations to remote
supabase db push

# Pull remote changes
supabase db pull

# Generate types
supabase gen types typescript --local > types/supabase.ts

# Run local development
supabase start
```

## Important Notes:
- Use your SERVICE_ROLE_KEY for CLI access (not anon key)
- The service role key is in your .env.local: SUPABASE_SERVICE_ROLE_KEY
- Keep this key secure - it has admin privileges
