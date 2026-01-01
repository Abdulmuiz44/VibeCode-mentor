# Deployment Notes - VibeCode Mentor

## Important: Environment Variables for Production

When deploying to Vercel, ensure these environment variables are set:

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
MISTRAL_API_KEY=<your-mistral-api-key>
NEXTAUTH_URL=https://vibecodementor.app
NEXTAUTH_SECRET=<generate-a-strong-secret>
GITHUB_ID=<your-github-oauth-id>
GITHUB_SECRET=<your-github-oauth-secret>
LEMONSQUEEZY_API_KEY=<your-lemonsqueezy-api-key>
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=<your-lemonsqueezy-store-id>
```

### Optional But Recommended
```
NEXT_PUBLIC_GA_TRACKING_ID=<your-google-analytics-id>
NEXT_PUBLIC_SITE_URL=https://vibecodementor.app
VERCEL_URL=vibecodementor.app
```

## Build Configuration

- Framework: Next.js 14.1.0
- Node Version: 18.x or higher
- Build Command: `npm run build`
- Install Command: `pnpm install`

## Known Issues & Fixes

### Issue: Sentry Build Errors
**Solution**: Sentry has been disabled in the build. Re-enable after resolving Next.js 14.2.x compatibility.

### Issue: Global Error Boundary
**Solution**: Removed Sentry integration from `app/global-error.tsx` to prevent runtime crashes.

## Deployment Steps

1. Push code to GitHub
2. Go to Vercel Dashboard
3. Click "New Project"
4. Select the VibeCode-mentor repository
5. Set all environment variables from the Required list above
6. Click "Deploy"
7. Monitor build logs for any errors
8. Test the deployed site at https://vibecodementor.app

## Post-Deployment Verification

- [ ] Landing page loads correctly
- [ ] Build page accessible and blueprint generation works
- [ ] Authentication (GitHub/Google) flows work
- [ ] Upgrade modal appears for free users
- [ ] Pro features work for paid users
- [ ] Database syncs properly with Supabase
- [ ] Analytics tracking works
- [ ] Error handling shows proper error pages

## Troubleshooting

If the app won't load:

1. Check Vercel build logs for errors
2. Verify all environment variables are set
3. Check if NEXT_PUBLIC_SUPABASE_URL and MISTRAL_API_KEY are present
4. Clear Vercel cache and redeploy
5. Check browser console for errors (F12)
