# Admin System - Visual Quick Guide

## 🎯 What Gets Unlocked

```
BEFORE                          AFTER (Admin Sign-In)
════════════════════════════════════════════════════════════════

Free User Features              Admin User Features
├─ 3 blueprints/day   ➜        ├─ Unlimited blueprints
├─ Copy/Save locally   ➜        ├─ All free features
├─ Download Markdown   ➜        ├─ Full Pro access
└─ 3 AI chats/day              ├─ Unlimited exports
                                ├─ Unlimited AI chats
(Limited & Restricted)          ├─ Admin API access
                                ├─ Manage other admins
                                └─ Bypass all rate limits
                                
                                (Unlimited & Full Control)
```

## ⚙️ Three-Step Setup

```
STEP 1: Edit .env.local
┌────────────────────────────────────┐
│ ADMIN_EMAIL=you@example.com        │
└────────────────────────────────────┘
          ↓
STEP 2: Run Migration
┌────────────────────────────────────┐
│ Copy SQL from:                     │
│ supabase/migrations/...sql         │
└────────────────────────────────────┘
          ↓
STEP 3: Sign In
┌────────────────────────────────────┐
│ Use email from ADMIN_EMAIL         │
│ → Automatic admin privileges ✅    │
└────────────────────────────────────┘
```

## 🔐 How It Works (Simple)

```
┌─────────────────────────────────────────────────────────────┐
│                    MAGIC HAPPENS HERE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  You Sign In with admin@example.com                          │
│           ↓                                                  │
│  System checks: Does email === ADMIN_EMAIL? ✅              │
│           ↓                                                  │
│  Database updated:                                           │
│    is_admin = TRUE ✅                                        │
│    is_pro = TRUE ✅                                          │
│    unlimited_gens = TRUE ✅                                  │
│    unlimited_exports = TRUE ✅                              │
│           ↓                                                  │
│  You get FULL POWER! 🚀                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Feature Comparison

```
┌─────────────────────┬──────────┬─────────┬───────────┐
│ Feature             │ Free     │ Pro     │ Admin     │
├─────────────────────┼──────────┼─────────┼───────────┤
│ Blueprints/day      │ 3        │ ∞       │ ∞         │
│ PDF Export          │ ❌       │ ✅      │ ✅        │
│ GitHub Export       │ ❌       │ ✅      │ ✅        │
│ AI Chats/day        │ 3        │ ∞       │ ∞         │
│ Admin Dashboard     │ ❌       │ ❌      │ ✅        │
│ Manage Admins       │ ❌       │ ❌      │ ✅        │
│ Rate Limit Bypass   │ ❌       │ ❌      │ ✅        │
└─────────────────────┴──────────┴─────────┴───────────┘
```

## 💻 Using Admin Status in Code

### Frontend (React Component)
```typescript
import { useAdminStatus } from '@/hooks/useAdminStatus';

export function MyApp() {
  const admin = useAdminStatus();
  
  return (
    <>
      {admin.isAdmin && <AdminDashboard />}
      {admin.isPro && <ProFeatures />}
      {admin.hasUnlimitedGenerations && <UnlimitedGen />}
    </>
  );
}
```

### Backend (API Route)
```typescript
import { getAdminUser } from '@/lib/admin/adminManager';

export async function POST(request: Request) {
  const admin = await getAdminUser(userId);
  
  if (!admin?.has_unlimited_generations) {
    // Check rate limit for regular users
    if (count >= LIMIT) return error(429);
  }
  
  // Process request
}
```

## 📱 UI Updates Needed (Examples)

### Before Admin Sign-In
```
┌──────────────────────────────────────┐
│ Generate Blueprint                   │
├──────────────────────────────────────┤
│                                      │
│ [Generate]                           │
│                                      │
│ ⚠️ Free users: 3/day limit          │
│ [Upgrade to Pro]                    │
│                                      │
└──────────────────────────────────────┘
```

### After Admin Sign-In
```
┌──────────────────────────────────────┐
│ 👑 ADMIN: Generate Blueprint         │
├──────────────────────────────────────┤
│                                      │
│ [Generate]                           │
│                                      │
│ ✅ Unlimited generations available   │
│                                      │
└──────────────────────────────────────┘
```

## 🔌 API Quick Reference

```
GET /api/admin/status
────────────────────
Response:
{
  "isAdmin": true,
  "isPro": true,
  "hasUnlimitedGenerations": true,
  "hasUnlimitedExports": true
}


POST /api/admin/manage
──────────────────────
Action 1: Grant Admin
Body: { "action": "grant", "targetUserId": "123" }

Action 2: Remove Admin
Body: { "action": "remove", "targetUserId": "123" }

Action 3: List Admins
Body: { "action": "list" }
```

## 🎓 Understanding the Flow

```
┌─────────┐
│ Browser │
└────┬────┘
     │ User clicks "Sign In"
     ▼
┌────────────────────────────────┐
│ Google/Email Login             │
│ Enter: admin@example.com       │
└────┬───────────────────────────┘
     │ OAuth callback
     ▼
┌────────────────────────────────┐
│ authOptions.ts (signIn)        │
│ ├─ Create user profile        │
│ └─ Check: is admin email? ✅   │
└────┬───────────────────────────┘
     │ YES! Set is_admin = true
     ▼
┌────────────────────────────────┐
│ Supabase (Database)            │
│ ├─ is_admin: true             │
│ ├─ is_pro: true               │
│ └─ unlimited: true            │
└────┬───────────────────────────┘
     │ Session created
     ▼
┌─────────────────────────────────────────┐
│ Redirect to /build (Home Page)          │
│ → useAdminStatus() returns admin: true │
│ → All features unlocked! 🚀             │
└─────────────────────────────────────────┘
```

## 📝 Integration Checklist

```
MUST HAVE (Required):
[✅] Set ADMIN_EMAIL in .env.local
[✅] Run database migration
[✅] Code already integrated in authOptions.ts

SHOULD HAVE (Recommended):
[ ] Add admin check in /api/mentor (rate limit bypass)
[ ] Add admin check in /api/export (bypass limits)
[ ] Show admin badge in UI
[ ] Hide rate limit warnings for admins

NICE TO HAVE (Optional):
[ ] Create admin dashboard component
[ ] Add audit logging
[ ] Promote other users to admin
[ ] Show admin status in header
```

## 🚀 After Setup

```
JUST ADDED:
├─ lib/admin/adminManager.ts          (Core logic)
├─ hooks/useAdminStatus.ts             (React hook)
├─ app/api/admin/status/route.ts       (Status API)
├─ app/api/admin/manage/route.ts       (Manage API)
├─ supabase/migrations/...sql          (DB update)
└─ Modified: lib/authOptions.ts        (Auto-init)

IMMEDIATELY AVAILABLE:
├─ useAdminStatus() in components
├─ getAdminUser() in APIs
├─ /api/admin/status endpoint
├─ /api/admin/manage endpoint
└─ Automatic admin initialization

TIME TO FIRST USE: 10 MINUTES ⏱️
```

## 🎯 Testing in Browser Console

```javascript
// Paste in browser console:

// 1. Check your admin status
fetch('/api/admin/status')
  .then(r => r.json())
  .then(d => console.log('Admin:', d))

// 2. List all admins
fetch('/api/admin/manage')
  .then(r => r.json())
  .then(d => console.log('All Admins:', d))

// 3. Promote a user (replace user-123)
fetch('/api/admin/manage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'grant',
    targetUserId: 'user-123'
  })
})
  .then(r => r.json())
  .then(d => console.log('Result:', d))
```

## 🆘 Quick Troubleshooting

```
PROBLEM: Not showing as admin after sign-in
SOLUTION:
  ├─ Check: exact email match in .env.local
  ├─ Check: ran migration
  ├─ Clear: browser cookies
  └─ Try: sign in again


PROBLEM: Still hitting rate limit
SOLUTION:
  ├─ Check: is_admin = true in database
  ├─ Verify: API route checks admin status first
  └─ Refresh: browser page


PROBLEM: Can't access /api/admin/manage
SOLUTION:
  ├─ Check: you are signed in
  ├─ Check: you are an admin (isAdmin: true)
  └─ Check: browser console for 403 error
```

## 📚 Documentation Files

```
QUICK (2-5 min):
├─ ADMIN_QUICK_REFERENCE.md
├─ ADMIN_SETUP_GUIDE.md (best to start)
└─ This file

DETAILED (10-20 min):
├─ ADMIN_SYSTEM_SUMMARY.md
├─ lib/admin/INTEGRATION_EXAMPLES.md
└─ lib/admin/ADMIN_SYSTEM.md

TECHNICAL (20-30 min):
└─ lib/admin/SYSTEM_ARCHITECTURE.md
```

## ✨ Key Takeaway

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│        ONE EMAIL IN ENV VARIABLE                    │
│                  ↓                                  │
│        ONE SIGN-IN WITH THAT EMAIL                  │
│                  ↓                                  │
│        UNLIMITED EVERYTHING ✅                      │
│                                                     │
│   No complex setup. No configuration files.         │
│   Just: Set env var → Sign in → Enjoy!             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

Ready? → Read `ADMIN_SETUP_GUIDE.md` (5 minutes) 🚀
