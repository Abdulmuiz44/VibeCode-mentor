# 🚀 Quick Setup Guide for New Services

## Priority Setup Order

### 1️⃣ Email Notifications (Resend) - 5 minutes ⚡
**Why First:** Improves user engagement immediately

1. Go to https://resend.com/signup
2. Create account (free tier: 100 emails/day, 3,000/month)
3. Verify your email
4. Go to https://resend.com/api-keys
5. Click "Create API Key"
6. Copy the key (starts with `re_`)
7. Add to Vercel: Environment Variables → `RESEND_API_KEY`
8. **Domain Setup (Optional but recommended):**
   - Go to Domains tab
   - Add your domain (e.g., vibecode-mentor.com)
   - Add DNS records shown
   - Once verified, emails will come from `noreply@vibecode-mentor.com`
9. **Test it:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/send-email \
     -H "Content-Type: application/json" \
     -d '{
       "type": "welcome",
       "to": "your-email@example.com",
       "userName": "Test User"
     }'
   ```

**Integration Points:**
- Welcome email: When user signs in for first time
- Payment confirmation: After successful Flutterwave payment
- Rate limit warning: When user hits 8/10 blueprints or 2/3 chats
- Weekly summary: Cron job every Monday

---

### 2️⃣ Google Analytics 4 - 10 minutes 📊
**Why Second:** Start collecting user data immediately

1. Go to https://analytics.google.com/
2. Click "Start measuring"
3. Create account name (e.g., "VibeCode Mentor")
4. Create property:
   - Property name: "VibeCode Mentor"
   - Timezone: Your timezone
   - Currency: USD
5. Fill business information
6. Choose "Web" platform
7. Enter website URL: `https://vibecode-mentor.vercel.app`
8. Create stream
9. **Copy Measurement ID** (format: `G-XXXXXXXXXX`)
10. Add to Vercel: Environment Variables → `NEXT_PUBLIC_GA_ID`
11. Redeploy app
12. **Verify setup:**
    - Go to GA4 → Reports → Realtime
    - Visit your website
    - Should see yourself in Realtime view within 30 seconds

**What You'll See:**
- Real-time visitors
- Page views
- User demographics
- Custom events (blueprint generated, chat used, etc.)
- Conversion tracking (Free → Pro)

---

### 3️⃣ Sentry Error Tracking - 15 minutes 🐛
**Why Third:** Critical for catching production bugs

1. Go to https://sentry.io/signup/
2. Create account (free tier: 5,000 errors/month)
3. Choose "Next.js" as platform
4. Create project name: "vibecode-mentor"
5. **Copy DSN** (format: `https://xxx@xxx.ingest.sentry.io/xxx`)
6. Go to Settings → Auth Tokens
7. Create new token:
   - Name: "Vercel Deployment"
   - Scopes: `project:read`, `project:releases`, `org:read`
8. Copy token
9. Add to Vercel Environment Variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://your_dsn_here
   SENTRY_ORG=your_organization_name
   SENTRY_PROJECT=vibecode-mentor
   SENTRY_AUTH_TOKEN=your_auth_token
   ```
10. Redeploy app
11. **Test it:**
    - Add this to any page: `throw new Error("Test error");`
    - Refresh page
    - Check Sentry dashboard → Issues
    - Remove test error

**What You'll See:**
- Real-time error alerts (email + Slack)
- Stack traces with source maps
- User context (browser, OS, URL)
- Session replays (watch what user did before error)
- Performance metrics

---

## Environment Variables Summary

Add these to Vercel → Settings → Environment Variables:

```bash
# Email Service (Required for user engagement)
RESEND_API_KEY=re_your_resend_api_key_here

# Analytics (Required for tracking)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Tracking (Required for production stability)
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn_here
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=vibecode-mentor
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

---

## Verification Checklist

After adding all environment variables and redeploying:

### Email Service ✅
- [ ] Send test welcome email via API
- [ ] Check Resend dashboard for delivery status
- [ ] Verify email received with correct formatting
- [ ] Check spam folder if not in inbox

### Analytics ✅
- [ ] Visit your website
- [ ] Check GA4 Realtime report (should see 1 active user)
- [ ] Generate a blueprint (check custom events)
- [ ] Use chat feature (check custom events)
- [ ] Check Vercel Analytics dashboard

### Error Tracking ✅
- [ ] Create test error in dev
- [ ] Check Sentry Issues dashboard
- [ ] Verify source maps show correct file/line
- [ ] Check session replay works
- [ ] Test email alerts

---

## Cost Breakdown (All Services)

| Service | Free Tier | Pro Cost | What You Get |
|---------|-----------|----------|--------------|
| **Resend** | 3,000 emails/month | $20/mo (50k emails) | Professional emails |
| **Google Analytics** | Unlimited | Free forever | All analytics features |
| **Sentry** | 5,000 errors/month | $29/mo (50k errors) | Error tracking + replays |
| **Vercel** | Free hobby tier | $20/mo (Pro) | Analytics + Speed Insights |

**Total Free Tier:** Good for ~500 active users/month  
**Total Paid (if needed):** $69/month for ~5,000 active users

---

## Integration Code Examples

### Send Welcome Email (After First Sign In)
```typescript
// In your NextAuth callback
import { sendWelcomeEmail } from '@/lib/email';

export default NextAuth({
  callbacks: {
    signIn: async ({ user, account, profile, email, credentials }) => {
      // Check if first time user (query Supabase)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (!existingUser) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'welcome',
            to: user.email,
            userName: user.name || 'there',
          }),
        });
      }
      return true;
    },
  },
});
```

### Track Blueprint Generation
```typescript
import { trackBlueprintGenerated } from '@/lib/analytics';

// After blueprint is generated
trackBlueprintGenerated(projectIdea, isPro);
```

### Capture Errors
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'blueprint-generation' },
    user: { id: userId, email: userEmail },
  });
}
```

---

## Monitoring Dashboards

Once set up, bookmark these:

1. **Resend Dashboard:** https://resend.com/emails
   - Monitor: Email delivery, opens, clicks
   
2. **Google Analytics:** https://analytics.google.com/
   - Monitor: User behavior, conversions, traffic sources
   
3. **Sentry Dashboard:** https://sentry.io/issues/
   - Monitor: Errors, performance, alerts
   
4. **Vercel Dashboard:** https://vercel.com/dashboard
   - Monitor: Deployments, analytics, logs

---

## Next Steps After Setup

1. **Set up email triggers** (1 hour)
   - Add welcome email to onAuthStateChanged
   - Add payment confirmation to webhook
   - Add rate limit warnings
   
2. **Create email sending cron job** (30 minutes)
   - Use Vercel Cron Jobs
   - Weekly summary every Monday 9am
   - Query Supabase for user stats
   
3. **Set up Sentry alerts** (15 minutes)
   - Configure Slack/Discord webhook
   - Set alert rules (e.g., >10 errors/hour)
   - Add team members
   
4. **Configure GA4 conversions** (30 minutes)
   - Mark "pro_upgrade" as conversion
   - Set up funnel analysis
   - Create custom dashboards

---

## Troubleshooting

### Emails not sending?
- Check RESEND_API_KEY is set correctly
- Verify domain DNS records if using custom domain
- Check Resend logs for errors
- Try sandbox domain first: onboarding@resend.dev

### Analytics not tracking?
- Ensure NEXT_PUBLIC_GA_ID starts with "G-"
- Check browser console for errors
- Disable ad blockers during testing
- Verify GA4 Realtime shows activity

### Sentry not capturing errors?
- Check NEXT_PUBLIC_SENTRY_DSN format
- Verify errors aren't filtered (check beforeSend)
- Development errors are filtered by default
- Test in production mode

---

**Setup Time:** ~30 minutes total  
**Expected Results:** Professional monitoring and user engagement  
**ROI:** Immediate insights into user behavior and app health

Happy monitoring! 🎉
