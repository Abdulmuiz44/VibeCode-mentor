# Supabase SMTP Email Configuration Setup Guide

## Overview
This guide configures transactional emails in Supabase for signup confirmations using custom SMTP.

## Prerequisites
- Supabase project
- Email service (Gmail, SendGrid, Postmark, etc.)
- SMTP credentials from your email provider

## Step 1: Configure SMTP in Supabase Dashboard

### 1.1 Access Email Settings
1. Go to your Supabase Dashboard
2. Navigate to: **Authentication** → **Email Templates**
3. Click on **SMTP Settings** tab

### 1.2 Add SMTP Configuration
Fill in your email provider's SMTP details:

```
Host: smtp.gmail.com (or your provider)
Port: 587 (TLS) or 465 (SSL)
Username: your-email@gmail.com
Password: your-app-password (not regular password)
Sender Email: noreply@yourdomain.com
Sender Name: VibeCode Mentor
```

### 1.3 Gmail Specific Setup
1. Enable 2-Factor Authentication on Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Create an "App Password" for Mail/Windows Mail
4. Copy the 16-character password
5. Use this as your SMTP Password

### 1.4 Enable Email Confirmation
1. Go to **Authentication** → **Providers** → **Email**
2. Enable: "Confirm email"
3. Set confirmation link expiry (default: 24 hours)

## Step 2: Configure Email Templates

### 2.1 Signup Confirmation Template
In Supabase Dashboard → **Email Templates**:

**Template Name:** Confirm signup

**Subject:** Welcome to VibeCode Mentor - Confirm Your Email

**Email Body:**
```html
<h1>Welcome to VibeCode Mentor!</h1>
<p>Hi {{ .ConfirmationURL | trimPrefix "https://yourapp.com/auth/callback?token_hash=" | trimPrefix "token_hash=" | base64_decode}},</p>
<p>Click the button below to confirm your email address:</p>
<a href="{{ .ConfirmationURL }}" style="background-color: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
  Confirm Email
</a>
<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link expires in 24 hours.</p>
<p>If you didn't create this account, you can safely ignore this email.</p>
```

### 2.2 Password Recovery Template
**Template Name:** Confirm password reset

**Subject:** Reset Your VibeCode Mentor Password

```html
<h1>Password Reset Request</h1>
<p>Click the button below to reset your password:</p>
<a href="{{ .RecoveryURL }}" style="background-color: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
  Reset Password
</a>
<p>This link expires in 1 hour.</p>
<p>If you didn't request this, ignore this email.</p>
```

## Step 3: Environment Variables

Add to your `.env.local`:

```env
# Supabase Email Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email verification (for redirect after confirmation)
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://yourdomain.com/auth/callback
```

## Step 4: Update Auth Page

The signup flow will now:
1. User signs up with email/password
2. Supabase automatically sends confirmation email
3. User clicks link in email to verify
4. Account is confirmed and ready to use

## Step 5: Handle Email Verification State

Create a hook to check email verification status:

```typescript
// lib/hooks/useEmailVerification.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useEmailVerification() {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsVerified(user.email_confirmed_at !== null);
      }
      setLoading(false);
    };

    checkVerification();
  }, []);

  return { isVerified, loading };
}
```

## Step 6: Database Considerations

Update your `users` table to track email verification:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Auto-update on confirmation
CREATE TRIGGER on_email_verified
AFTER UPDATE ON auth.users
FOR EACH ROW
BEGIN
  UPDATE users 
  SET email_verified = (NEW.email_confirmed_at IS NOT NULL)
  WHERE user_id = NEW.id;
END;
```

## Testing Email Sending

### 1. Test Mode (Development)
Use Supabase's test credentials first:
- Go to **Email Templates**
- Click "Send Test Email" to verify setup

### 2. View Email Logs
- Dashboard → **Monitoring** → **Logs**
- Filter by "auth"
- Check for email sending events

### 3. Common Issues

**Issue:** Emails not sending
- Check SMTP credentials are correct
- Verify sender email is authorized
- Check email provider's sending limits

**Issue:** Links not working
- Verify `NEXT_PUBLIC_AUTH_REDIRECT_URL` is set
- Check callback URL is registered in Supabase
- Ensure link hasn't expired

**Issue:** Emails going to spam
- Add SPF, DKIM, DMARC records
- Use branded domain (not gmail.com)
- Include unsubscribe link

## Production Checklist

- [ ] SMTP credentials configured
- [ ] Email templates customized with branding
- [ ] DNS records (SPF, DKIM) configured
- [ ] Test signup flow end-to-end
- [ ] Verify email appears in inbox (not spam)
- [ ] Monitor email delivery metrics
- [ ] Set up alerts for delivery failures
- [ ] Document backup email provider

## Alternative Email Providers

### SendGrid
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: Your SendGrid API key

### Postmark
- Host: `smtp.postmarkapp.com`
- Port: `587`
- Username: Your server token
- Password: Your server token

### AWS SES
- Host: `email-smtp.region.amazonaws.com`
- Port: `587`
- Username: SMTP username
- Password: SMTP password

## Reference Links

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Setup](https://sendgrid.com/docs/for-developers/sending-email/integrating-with-the-smtp-api/)
