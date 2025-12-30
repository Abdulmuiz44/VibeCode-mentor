# Code Generator Deployment Checklist

## Phase 1: Database & Infrastructure ✅

- [x] Created Supabase migrations (`supabase/migrations/generate_projects.sql`)
  - Tables: `generated_projects`, `project_generation_steps`, `github_tokens`
  - RLS policies implemented
  - Automatic timestamp updates

- [ ] Run Supabase migrations
  ```bash
  npx supabase db push
  # or manual SQL execution in Supabase dashboard
  ```

- [ ] Verify tables exist
  ```bash
  npx supabase db pull  # pulls current schema
  ```

## Phase 2: GitHub OAuth ✅

- [x] GitHub OAuth utilities created (`lib/github/oauth.ts`)
  - Authorization URL generation
  - Token exchange
  - User info retrieval

- [x] GitHub Repository utilities created (`lib/github/repository.ts`)
  - Repository creation
  - File pushing to GitHub
  - Branch management

- [ ] Register GitHub OAuth App
  1. Go to https://github.com/settings/developers
  2. Create new OAuth App
  3. Save Client ID & Secret

- [ ] Set environment variables
  ```env
  GITHUB_CLIENT_ID=your_id
  GITHUB_CLIENT_SECRET=your_secret
  GITHUB_REDIRECT_URI=https://yourdomain.com/api/auth/github/callback
  ```

- [ ] Update GitHub OAuth callback URL
  - Add to GitHub app settings
  - For development: `http://localhost:3000/api/auth/github/callback`
  - For production: `https://yourdomain.com/api/auth/github/callback`

## Phase 3: API Routes ✅

- [x] Generated project API endpoints
  - `POST /api/generate-project` - Create project
  - `GET /api/generate-project/[id]/status` - Check status
  - `GET /api/auth/github` - Start OAuth flow
  - `GET /api/auth/github/callback` - OAuth callback
  - `POST /api/github/disconnect` - Revoke GitHub token

- [ ] Test all endpoints
  ```bash
  # Generate project
  curl -X POST http://localhost:3000/api/generate-project \
    -H "Content-Type: application/json" \
    -d '{"projectName":"TestApp","description":"Test","features":["auth"],...}'

  # Check status
  curl http://localhost:3000/api/generate-project/[projectId]/status

  # Start GitHub auth
  curl http://localhost:3000/api/auth/github

  # Disconnect
  curl -X POST http://localhost:3000/api/github/disconnect
  ```

## Phase 4: UI Components ✅

- [x] Blueprint form component (`app/generate-project/page.tsx`)
  - Project basics
  - Feature selection
  - Database schema input
  - API endpoints
  - UI components
  - Deployment requirements

- [x] Generation progress page (`app/generate-project/[projectId]/page.tsx`)
  - Real-time progress tracking
  - Step-by-step display
  - Error handling
  - GitHub link on completion

- [ ] Connected accounts page (create new)
  ```bash
  # Create: app/dashboard/connected-accounts/page.tsx
  # Features:
  # - Show GitHub connection status
  # - Display GitHub username
  # - Button to connect/disconnect GitHub
  # - OAuth flow trigger
  ```

## Phase 5: Code Generation ✅

- [x] Blueprint parser (`lib/code-generator/blueprint-parser.ts`)
- [x] Code generator (`lib/code-generator/generator.ts`)
- [x] Template generators (10+ templates)
- [x] Project exporter (`lib/code-generator/exporter.ts`)

- [ ] Test code generation locally
  ```typescript
  import { CodeGenerator } from '@/lib/code-generator/generator';
  
  const blueprint = { /* ... */ };
  const generator = new CodeGenerator(blueprint);
  const project = generator.generate();
  
  console.log(`Generated ${project.summary.totalFiles} files`);
  ```

## Phase 6: Background Jobs (Choose One)

Choose a job queue for async generation:

### Option A: Bull Queue (Recommended for self-hosted)
```bash
npm install bull
npm install @types/bull -D
```

### Option B: Inngest (Best for Vercel)
```bash
npm install inngest
```

### Option C: Vercel Cron (Simplest)
```bash
# Create: lib/cron/generateProjects.ts
# Call from: app/api/cron/generate-projects.ts
```

## Phase 7: Deployment

### Vercel
- [ ] Set environment variables in Vercel dashboard
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_REDIRECT_URI`
  - Database credentials

- [ ] Update GitHub OAuth callback URL
  - From: `http://localhost:3000/api/auth/github/callback`
  - To: `https://yourdomain.vercel.app/api/auth/github/callback`

- [ ] Deploy to Vercel
  ```bash
  git push origin main
  # Vercel auto-deploys
  ```

### Self-hosted
- [ ] Build application
  ```bash
  npm run build
  ```

- [ ] Set production environment variables
- [ ] Run migrations
- [ ] Start server
  ```bash
  npm run start
  ```

## Phase 8: Testing

### Manual Testing
- [ ] Test blueprint form submission
- [ ] Test code generation
- [ ] Test GitHub OAuth flow
- [ ] Test project creation
- [ ] Test status polling
- [ ] Test error cases

### Integration Tests
- [ ] Blueprint parsing
- [ ] Code generation
- [ ] File structure validation
- [ ] GitHub API calls
- [ ] Database operations

## Phase 9: Monitoring & Analytics

- [ ] Set up error tracking
  ```typescript
  import * as Sentry from "@sentry/nextjs";
  
  try {
    await generateProject(blueprint);
  } catch (error) {
    Sentry.captureException(error);
  }
  ```

- [ ] Track generation metrics
  - Generation time
  - File count
  - Success rate
  - GitHub push failures

- [ ] Log important events
  - Project created
  - GitHub connected
  - Generation completed
  - Errors

## Phase 10: Documentation

- [x] Code Generator Integration Guide
- [x] GitHub OAuth Setup Guide
- [ ] User documentation (FAQ, troubleshooting)
- [ ] API documentation (OpenAPI/Swagger)

## Phase 11: Security Review

- [ ] CSRF protection (state tokens) ✅
- [ ] SQL injection prevention (parameterized queries) ✅
- [ ] XSS prevention (React escaping) ✅
- [ ] Rate limiting on API endpoints
- [ ] File size limits on uploads
- [ ] Token expiration handling
- [ ] Secure storage of GitHub tokens
- [ ] RLS policies verified

## Phase 12: Performance Optimization

- [ ] Code generation benchmarking
- [ ] Database query optimization
- [ ] API response caching
- [ ] Async generation for large projects
- [ ] File streaming for large downloads

## Launch Checklist

- [ ] All tests passing
- [ ] Production environment tested
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] GitHub OAuth configured
- [ ] Error handling complete
- [ ] Analytics tracking enabled
- [ ] Documentation updated
- [ ] Security review done
- [ ] Performance benchmarked
- [ ] User onboarding ready

## Post-Launch

- [ ] Monitor error rates
- [ ] Track user engagement
- [ ] Gather user feedback
- [ ] Monitor GitHub API usage
- [ ] Plan feature updates
  - Private repository support
  - Additional stacks (Vue, Python, etc.)
  - Deployment automation
  - CI/CD generation
  - Testing framework setup

## Commands Quick Reference

```bash
# Development
npm run dev

# Database
npx supabase db push          # Apply migrations
npx supabase db pull          # Get current schema
npx supabase migration new    # Create new migration

# Testing
npm run test

# Build
npm run build

# Deploy
git push origin main          # Triggers Vercel deploy

# Cleanup
rm -rf .next
npm run clean
```

## Support

- GitHub Issues: https://github.com/Abdulmuiz44/VibeCode-mentor/issues
- Documentation: See `CODE_GENERATOR_INTEGRATION.md`
- OAuth Help: See `GITHUB_OAUTH_SETUP.md`

---

**Current Status**: Phase 5 Complete ✅
**Next**: Database migrations (Phase 1)
**Estimated Launch**: 1-2 weeks
