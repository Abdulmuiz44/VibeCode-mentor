# Supabase SMTP Email Verification - Quick Start

## 5-Minute Setup

### Step 1: Get SMTP Credentials
Choose your email provider and get SMTP credentials:

**Gmail:**
1. Enable 2FA on Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" → "Windows Mail" (or equivalent)
4. Copy the 16-character password

**SendGrid:**
1. Create account at sendgrid.com
2. Create API key
3. Use `apikey` as username, API key as password

**Postmark:**
1. Create account at postmark.com
2. Create server
3. Copy Server Token - use as both username and password

### Step 2: Configure Supabase Dashboard

1. Go to **Authentication** → **Email Templates**
2. Click **SMTP Settings**
3. Fill in:
   ```
   Host: smtp.gmail.com (or your provider)
   Port: 587
   Username: your-email@gmail.com (or credentials from step 1)
   Password: your-app-password
   Sender Email: noreply@yourdomain.com
   Sender Name: VibeCode Mentor
   ```
4. Click **Test Connection** to verify
5. Enable "Confirm email" under **Providers** → **Email**

### Step 3: Set Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

For local testing:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Test Signup Flow

1. Go to `/auth`
2. Click "Sign Up"
3. Fill in details and submit
4. Check email for confirmation link
5. Click link to verify
6. Login with email/password

## Email Templates (Optional)

Customize email templates in Supabase Dashboard → **Email Templates**

### Signup Confirmation Template
```html
<h1>Welcome to VibeCode Mentor!</h1>
<p>Click here to confirm your email:</p>
<a href="{{ .ConfirmationURL }}">
  Confirm Email
</a>
```

### Password Reset Template
```html
<h1>Reset Your Password</h1>
<a href="{{ .RecoveryURL }}">
  Reset Password
</a>
```

## Code Integration

### Signup with Email Verification
Already integrated in `/app/auth/page.tsx`

### Resend Verification Email
```typescript
import { resendVerificationEmail } from '@/lib/email';

const result = await resendVerificationEmail('user@example.com');
if (result.success) {
  console.log(result.message);
}
```

### Check Email Verification Status
```typescript
import { isEmailVerified } from '@/lib/email';

const verified = await isEmailVerified(userId);
```

### Send Password Reset
```typescript
import { sendPasswordResetEmail } from '@/lib/email';

const result = await sendPasswordResetEmail('user@example.com');
```

## Database Schema

Optional: Track email verification in your `users` table:

```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;
```

## Troubleshooting

### Emails Not Sending
- ✓ Verify SMTP credentials in Dashboard
- ✓ Check sender email is authorized
- ✓ Look at Dashboard → **Logs** for errors

### Links Not Working
- ✓ Verify `NEXT_PUBLIC_APP_URL` is set correctly
- ✓ Check callback URL matches redirect settings
- ✓ Ensure email redirect URL is added to Supabase

### Emails Going to Spam
- ✓ Use your own domain (not gmail.com)
- ✓ Add SPF, DKIM, DMARC records to DNS
- ✓ Use reputable email provider (SendGrid, Postmark)
- ✓ Verify sender name matches domain

### Token Expired Errors
- ✓ Default expiry is 24 hours
- ✓ Add "Resend" button in UI to allow re-requesting
- ✓ Adjust expiry in Supabase settings

## Email Pages

### Authentication Page
- Path: `/app/auth/page.tsx`
- Handles signup and email verification UI

### Email Verification Page
- Path: `/app/auth/email-verification.tsx`
- Shows confirmation status when user clicks email link

### Callback Handler
- Path: `/app/auth/callback/route.ts`
- Processes verification links from emails

## Files Created

1. **SUPABASE_SMTP_SETUP.md** - Comprehensive setup guide
2. **SMTP_QUICK_START.md** - This file
3. **app/auth/page.tsx** - Updated with email verification
4. **app/auth/email-verification.tsx** - Verification status page
5. **app/auth/callback/route.ts** - Email link handler
6. **lib/email.ts** - Email utility functions
7. **.env.example** - Environment variables template

## Next Steps

- [ ] Get SMTP credentials from email provider
- [ ] Configure Supabase Dashboard
- [ ] Set environment variables
- [ ] Test signup flow locally
- [ ] Customize email templates
- [ ] Deploy to production
- [ ] Monitor email delivery

## Support

For detailed configuration, see **SUPABASE_SMTP_SETUP.md**

For issues, check:
- Supabase Documentation: https://supabase.com/docs/guides/auth/auth-email
- Email Provider Docs: (SendGrid, Gmail, etc.)
- Dashboard Logs: Authentication → Logs
