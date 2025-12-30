# GitHub OAuth Setup Guide

This guide explains how to set up GitHub OAuth for VibeCode Mentor's code generation feature.

## Overview

The code generator can push generated projects directly to GitHub. This requires OAuth setup so users can securely authorize VibeCode Mentor to create repositories on their behalf.

## Steps

### 1. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in the form:
   - **Application name**: VibeCode Mentor
   - **Homepage URL**: `https://vibecodementor.com` (or your domain)
   - **Authorization callback URL**: `https://vibecodementor.com/api/auth/github/callback`
   - **Application description**: AI-powered code generator

4. Click **Create OAuth App**

5. You'll see your credentials:
   - **Client ID**: Copy this
   - **Client Secret**: Copy this

### 2. Add Environment Variables

Add to `.env.local`:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=https://vibecodementor.com/api/auth/github/callback
```

For local development:

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

### 3. Database Setup

Run the Supabase migration:

```bash
# Push migrations to Supabase
npx supabase migration up

# Or manually run the SQL in supabase/migrations/generate_projects.sql
```

This creates:
- `generated_projects` table
- `project_generation_steps` table
- `github_tokens` table
- RLS policies for security

### 4. Update GitHub OAuth Redirect URLs

**Important**: GitHub requires exact URL matching.

**For Production:**
- Homepage URL: `https://vibecodementor.com`
- Authorization callback URL: `https://vibecodementation.com/api/auth/github/callback`

**For Local Development:**
Add another callback URL in GitHub settings:
- `http://localhost:3000/api/auth/github/callback`

You can register multiple callback URLs. GitHub will use the one that matches your current domain.

## API Endpoints

### 1. Start GitHub OAuth Flow

**Endpoint**: `GET /api/auth/github`

Returns the GitHub authorization URL.

```typescript
const response = await fetch('/api/auth/github');
const { authUrl } = await response.json();
window.location.href = authUrl;
```

### 2. GitHub OAuth Callback

**Endpoint**: `GET /api/auth/github/callback`

Handled automatically by Next.js. GitHub redirects here after user authorizes.

### 3. Disconnect GitHub

**Endpoint**: `POST /api/github/disconnect`

Revokes GitHub token access.

```typescript
await fetch('/api/github/disconnect', { method: 'POST' });
```

## File Structure

```
lib/github/
├── oauth.ts              # GitHub OAuth flow
└── repository.ts         # Create repos & push files

lib/db/
└── projects.ts           # Database operations

app/api/auth/github/
├── route.ts              # Start OAuth flow
└── callback/route.ts     # OAuth callback

app/api/github/
└── disconnect/route.ts   # Revoke token

app/api/generate-project/
└── route.ts              # Generate + push to GitHub
```

## Security

### CSRF Protection
- State token generated and stored in httpOnly cookie
- Verified on callback
- Prevents CSRF attacks

### Token Storage
- Access tokens stored in Supabase
- httpOnly cookies (not accessible to JavaScript)
- Encrypted in transit (HTTPS only in production)
- RLS policies prevent unauthorized access

### Permissions
- Scopes: `repo,user`
- Can create repositories
- Can push code
- Can create branches
- Users see what permissions are requested

## Testing

### Local Testing

1. Start dev server:
```bash
npm run dev
```

2. Go to `/generate-project`

3. Fill out the form and click "Generate & Push to GitHub"

4. You'll be redirected to GitHub to authorize

5. After authorizing, your project is created and pushed

### Test Cases

- User not logged in → redirects to login
- User has no GitHub connected → generates project locally
- User has GitHub connected → generates and pushes to GitHub
- OAuth fails → shows error message
- Repository already exists → should fail gracefully

## Troubleshooting

### "Invalid state parameter"
- OAuth state token expired (> 10 minutes)
- Browser cookies disabled
- Multiple tabs with different state tokens

**Fix**: Clear cookies and try again

### "Invalid client ID"
- Wrong GITHUB_CLIENT_ID in .env.local
- Check GitHub app settings

**Fix**: Copy exact client ID from GitHub settings

### "Redirect URI mismatch"
- Authorization callback URL doesn't match request
- Localhost vs production domain mismatch

**Fix**: Register all callback URLs in GitHub settings

### "Repository creation failed"
- User hit GitHub API rate limit
- GitHub account has restrictions
- Repository name already exists

**Fix**: Check GitHub API status, use different name

### "Token not found"
- User not logged in
- Session expired

**Fix**: Log in again

## Rate Limits

GitHub API has rate limits:
- **Authenticated requests**: 5,000 per hour per user
- **Each project generation**: ~5-10 API calls
- **Safe limit**: 400-500 projects per hour

For production with high usage, consider:
- Caching repository metadata
- Batching API calls
- Using GitHub Apps instead of OAuth

## Advanced: GitHub Apps

For enterprise use, consider GitHub Apps instead of OAuth:
- Finer-grained permissions
- No user authentication needed
- Works across organizations
- Better for CI/CD integration

See: https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps

## Production Checklist

- [ ] GitHub OAuth app created
- [ ] Environment variables set in Vercel/hosting
- [ ] Supabase migrations applied
- [ ] HTTPS enabled
- [ ] Authorization callback URL updated
- [ ] Rate limiting considered
- [ ] Error handling tested
- [ ] User notified if GitHub not connected

## Monitoring

Monitor these metrics:
- GitHub API errors
- Token refresh failures
- Repository creation timeouts
- User disconnection rates

Example Sentry integration:

```typescript
try {
  await pushProjectToGithub(token, name, description, files);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'code-generator' },
  });
}
```

---

**Status**: Production-ready | **Last Updated**: 2024
