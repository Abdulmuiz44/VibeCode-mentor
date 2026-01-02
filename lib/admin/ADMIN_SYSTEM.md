# Admin System Documentation

## Overview

VibeCode Mentor now has a comprehensive admin system that grants full platform access to designated administrator users.

## Features

### Automatic Admin Initialization

When the user with `ADMIN_EMAIL` from environment variables signs in:
- They are automatically granted admin status
- Pro plan is enabled automatically
- Unlimited generations and exports are granted
- No manual configuration needed

### Admin Privileges

Admin users get:
- ✅ Full Pro plan features
- ✅ Unlimited blueprint generations (no rate limiting)
- ✅ Unlimited exports (PDF, Markdown, GitHub)
- ✅ Access to admin dashboard
- ✅ Ability to grant/revoke admin privileges to other users
- ✅ Full access to all user data (with RLS policies)
- ✅ Bypass all rate limits and restrictions

## Setup

### 1. Environment Variable

Add your admin email to `.env.local`:

```env
ADMIN_EMAIL=your-email@example.com
```

### 2. Database Migration

Run the migration to add admin fields to the users table:

```bash
# Using Supabase CLI
supabase migration up

# OR manually in Supabase SQL Editor:
# Copy contents of: supabase/migrations/add_admin_fields.sql
```

This adds:
- `is_admin` (boolean)
- `has_unlimited_generations` (boolean)
- `has_unlimited_exports` (boolean)
- Index for fast lookups
- Updated RLS policies

### 3. Sign In

Sign in with the `ADMIN_EMAIL` address. The system will:
1. Detect the admin email
2. Automatically set `is_admin = true`
3. Set `is_pro = true`
4. Grant unlimited access

## Usage

### Frontend

Use the `useAdminStatus` hook to check admin status in components:

```typescript
import { useAdminStatus } from '@/hooks/useAdminStatus';

export function MyComponent() {
  const admin = useAdminStatus();

  if (admin.loading) return <div>Loading...</div>;

  if (admin.isAdmin) {
    return <div>Welcome, admin! You have full access.</div>;
  }

  return <div>Regular user view</div>;
}
```

### API Endpoints

#### Get Admin Status
```
GET /api/admin/status
Response: {
  isAdmin: boolean,
  isPro: boolean,
  hasUnlimitedGenerations: boolean,
  hasUnlimitedExports: boolean
}
```

#### Manage Admin Privileges (Admin-only)
```
POST /api/admin/manage
Body: {
  action: 'grant' | 'remove' | 'list',
  targetUserId?: string
}
```

Examples:
```javascript
// Grant admin to another user
fetch('/api/admin/manage', {
  method: 'POST',
  body: JSON.stringify({
    action: 'grant',
    targetUserId: 'user-id-to-promote'
  })
});

// Remove admin from a user
fetch('/api/admin/manage', {
  method: 'POST',
  body: JSON.stringify({
    action: 'remove',
    targetUserId: 'user-id-to-demote'
  })
});

// List all admin users
fetch('/api/admin/manage?action=list', {
  method: 'GET'
});
```

### Backend

Use the admin manager functions:

```typescript
import {
  initializeAdminUser,
  isAdminUser,
  getAdminUser,
  grantAdminPrivileges,
  removeAdminPrivileges,
  listAdminUsers,
} from '@/lib/admin/adminManager';

// Check if a user is admin
const isAdmin = await isAdminUser(userId);

// Get admin user details
const admin = await getAdminUser(userId);

// Grant admin to a user (requires current user to be admin)
await grantAdminPrivileges(currentUserId, targetUserId);

// Remove admin from a user
await removeAdminPrivileges(currentUserId, targetUserId);

// List all admins
const admins = await listAdminUsers();
```

## How It Works

### Sign-In Flow

```
User Signs In
    ↓
authOptions.ts signIn callback
    ↓
upsertUserProfile (create/update user)
    ↓
initializeAdminUser (check if email matches ADMIN_EMAIL)
    ↓
If matches:
  - Set is_admin = true
  - Set is_pro = true
  - Set has_unlimited_generations = true
  - Set has_unlimited_exports = true
    ↓
User logged in with admin privileges
```

### Rate Limiting Bypass

When checking rate limits in API routes, check for admin status first:

```typescript
// In /api/mentor or other endpoints
const adminUser = await getAdminUser(userId);

if (adminUser?.has_unlimited_generations) {
  // Skip rate limit check for admin
  proceed();
} else {
  // Check rate limit for regular users
  const count = await checkRateLimit(userId);
  if (count >= LIMIT) {
    return error('Rate limited');
  }
}
```

### Database Schema

```sql
-- Users table (existing) with new admin fields:
CREATE TABLE public.users (
  user_id UUID PRIMARY KEY,
  email VARCHAR,
  name VARCHAR,
  profile_image TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,        -- NEW
  has_unlimited_generations BOOLEAN,     -- NEW
  has_unlimited_exports BOOLEAN,         -- NEW
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_users_is_admin ON public.users(is_admin);
```

## Security Considerations

1. **ADMIN_EMAIL in Environment**
   - Stored in `.env.local` (never committed)
   - Only checked during sign-in
   - Automatically removed from memory after use

2. **RLS Policies**
   - Admin users can bypass RLS policies
   - Supabase `is_admin` flag enables this
   - All sensitive operations are still logged

3. **API Protection**
   - All admin endpoints require `getServerSession`
   - `isAdminUser()` check on every admin action
   - Cannot remove own admin privileges

4. **No Hardcoded Credentials**
   - Admin status is tied to `ADMIN_EMAIL` only
   - No admin password or token
   - Uses NextAuth session validation

## Troubleshooting

### Admin status not applied after sign-in

1. Check `ADMIN_EMAIL` in `.env.local` matches sign-in email exactly
2. Check database migration was applied
3. Clear browser cookies and sign in again
4. Check server logs for initialization errors

### Cannot access admin features

1. Verify `isAdmin` field is `true` in database
2. Check `useAdminStatus()` hook shows `isAdmin: true`
3. Verify API endpoint returns `isAdmin: true`
4. Check browser network tab for 403 errors on admin endpoints

### Rate limits still being applied

Make sure to add admin check before rate limit logic:

```typescript
const admin = await getAdminUser(userId);
if (!admin?.has_unlimited_generations) {
  // Apply rate limit
}
```

## Testing

### Manual Testing Checklist

- [ ] Sign in with `ADMIN_EMAIL`
- [ ] Check `useAdminStatus()` shows admin: true
- [ ] Verify no rate limit messages appear
- [ ] Generate blueprints without hitting rate limit
- [ ] Access admin dashboard (if implemented)
- [ ] Try to grant admin to another user
- [ ] List all admin users

### Debug Mode

In `.env.local` (development only):

```env
DEBUG_ADMIN=true
```

This will log admin initialization details to console.

## Future Enhancements

- [ ] Admin dashboard UI component
- [ ] User management interface
- [ ] Audit logs for admin actions
- [ ] Multi-level admin roles (Super, Moderator, Support)
- [ ] Admin action approvals for sensitive operations
- [ ] Admin activity logging

## Related Files

- `lib/admin/adminManager.ts` - Core admin logic
- `lib/authOptions.ts` - Sign-in integration
- `hooks/useAdminStatus.ts` - Frontend hook
- `app/api/admin/status/route.ts` - Status endpoint
- `app/api/admin/manage/route.ts` - Management endpoint
- `supabase/migrations/add_admin_fields.sql` - Database migration
