# Admin Setup Guide - VibeCode Mentor

## Quick Start (5 minutes)

### Step 1: Set Environment Variable

In your `.env.local` file, add:

```env
ADMIN_EMAIL=your-email@example.com
```

Replace `your-email@example.com` with the email you'll use to sign in.

**IMPORTANT**: Never commit `.env.local` to git.

### Step 2: Apply Database Migration

The system includes a migration to add admin fields to the database.

#### Option A: Using Supabase CLI
```bash
supabase migration up
```

#### Option B: Manual SQL in Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy and paste contents from: `supabase/migrations/add_admin_fields.sql`
4. Execute

### Step 3: Sign In and Verify

1. Go to your app
2. Click "Sign In"
3. Choose Google or your auth method
4. **Use the email address from ADMIN_EMAIL**
5. The system automatically grants admin privileges

### Step 4: Verify Admin Status

In browser console:

```javascript
// Fetch admin status
fetch('/api/admin/status')
  .then(r => r.json())
  .then(console.log)

// Output should show:
// {
//   isAdmin: true,
//   isPro: true,
//   hasUnlimitedGenerations: true,
//   hasUnlimitedExports: true
// }
```

## What Admin Users Get

✅ **Pro Plan** - Automatically enabled
✅ **Unlimited Generations** - No daily rate limit
✅ **Unlimited Exports** - PDF, Markdown, GitHub
✅ **Admin Dashboard** - Manage other admins (if implemented)
✅ **Full Data Access** - Bypass RLS policies

## Files Added

### Core Admin System
- `lib/admin/adminManager.ts` - Admin business logic
- `lib/admin/ADMIN_SYSTEM.md` - Complete documentation

### Frontend Integration
- `hooks/useAdminStatus.ts` - React hook for checking admin status
- `app/api/admin/status/route.ts` - Get current user's admin status
- `app/api/admin/manage/route.ts` - Grant/remove admin privileges

### Database
- `supabase/migrations/add_admin_fields.sql` - Database migration

## Using Admin Status in Components

```typescript
'use client';

import { useAdminStatus } from '@/hooks/useAdminStatus';

export function MyComponent() {
  const admin = useAdminStatus();

  if (admin.loading) {
    return <p>Checking permissions...</p>;
  }

  return (
    <>
      <p>Admin: {admin.isAdmin ? 'Yes' : 'No'}</p>
      <p>Pro: {admin.isPro ? 'Yes' : 'No'}</p>
      <p>Unlimited Gens: {admin.hasUnlimitedGenerations ? 'Yes' : 'No'}</p>
    </>
  );
}
```

## Promoting Other Users to Admin

If you want to make another user an admin:

```javascript
// Call this from browser console or admin dashboard
fetch('/api/admin/manage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'grant',
    targetUserId: 'user-uuid-here'
  })
})
.then(r => r.json())
.then(console.log)
```

## Rate Limit Bypass Example

In your API routes, check for admin status before applying rate limits:

```typescript
// app/api/mentor/route.ts
import { getAdminUser } from '@/lib/admin/adminManager';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session.user.id;

  // Check if admin
  const admin = await getAdminUser(userId);
  
  // Admin users bypass rate limits
  if (!admin?.has_unlimited_generations) {
    // Apply rate limit check for regular users
    const count = await checkRateLimit(userId);
    if (count >= 3) {
      return Response.json({ error: 'Rate limited' }, { status: 429 });
    }
  }

  // Process request...
}
```

## Troubleshooting

### Q: I set ADMIN_EMAIL but admin status isn't showing

**A**: 
1. Make sure you're signing in with the exact email
2. Clear cookies and sign in again
3. Check Supabase migration was applied
4. Check server logs for errors

### Q: How do I remove admin privileges?

```javascript
fetch('/api/admin/manage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'remove',
    targetUserId: 'user-uuid-here'
  })
})
```

### Q: Can I have multiple admins?

**A**: Yes! Use the admin management API to promote other users.

### Q: Is this secure?

**A**: Yes. The system uses:
- Environment variable (not in code)
- NextAuth session validation
- Database RLS policies
- Server-side verification on every admin action

## Environment Variables Reference

```env
# REQUIRED
ADMIN_EMAIL=your-email@example.com

# Already existing
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Next Steps

1. ✅ Set `ADMIN_EMAIL` in `.env.local`
2. ✅ Run database migration
3. ✅ Sign in with admin email
4. ✅ Verify admin status (check console)
5. ✅ Test unlimited features (blueprints, exports)
6. ✅ Promote other users to admin if needed

## Support

For issues or questions:
1. Check `lib/admin/ADMIN_SYSTEM.md` for full documentation
2. Review `lib/admin/adminManager.ts` for implementation details
3. Check server logs for initialization errors
4. Verify all environment variables are set correctly

---

**Ready to use admin features?** Sign in with your `ADMIN_EMAIL` now! 🚀
