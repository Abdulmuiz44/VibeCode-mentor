# Admin System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIBECODE MENTOR ADMIN SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   ENVIRONMENT        │
│  ├─ ADMIN_EMAIL      │
│  └─ (Supabase creds) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User Signs In (Google OAuth / Credentials)                      │
│          │                                                        │
│          ▼                                                        │
│  authOptions.ts (signIn callback)                                │
│          │                                                        │
│          ├─ upsertUserProfile()                                  │
│          │   └─ Create/update user in database                   │
│          │                                                        │
│          └─ initializeAdminUser()                                │
│              ├─ Check: email === ADMIN_EMAIL ?                   │
│              │                                                    │
│              ├─ IF YES:                                          │
│              │   ├─ Set is_admin = true                          │
│              │   ├─ Set is_pro = true                            │
│              │   ├─ Set has_unlimited_generations = true         │
│              │   ├─ Set has_unlimited_exports = true             │
│              │   └─ Return AdminUser object                      │
│              │                                                    │
│              └─ IF NO:                                           │
│                  └─ Return null (regular user)                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Supabase PostgreSQL                                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ users table                                                 │ │
│  ├──────────────────────────────────────────────────────────┬─┤ │
│  │ user_id │ email │ name │ ... │ is_admin │ is_pro │ ...  │ │ │
│  ├──────────────────────────────────────────────────────────┼─┤ │
│  │ uuid-1  │ admin │      │     │   true   │  true  │       │ │ │
│  │ uuid-2  │ user1 │      │     │  false   │  true  │       │ │ │
│  │ uuid-3  │ user2 │      │     │  false   │ false  │       │ │ │
│  └──────────────────────────────────────────────────────────┴─┘ │
│                                                                   │
│  New Columns (from migration):                                   │
│  ├─ is_admin (boolean, DEFAULT false)                            │
│  ├─ has_unlimited_generations (boolean)                          │
│  ├─ has_unlimited_exports (boolean)                              │
│  └─ Index on is_admin for fast queries                           │
│                                                                   │
│  RLS Policies:                                                   │
│  ├─ Users can read own data                                      │
│  ├─ Admins can read all data                                     │
│  ├─ Users can update own data                                    │
│  └─ Admins can update all data                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Component Communication Flow

```
┌────────────────┐
│   FRONTEND     │
│   (Browser)    │
└────────┬───────┘
         │
         ▼
   ┌─────────────────────────────────────────────┐
   │  useAdminStatus() Hook                       │
   │  ├─ Checks session?.user?.id                 │
   │  ├─ Calls GET /api/admin/status              │
   │  ├─ Returns: AdminStatus object              │
   │  │  ├─ isAdmin: boolean                      │
   │  │  ├─ isPro: boolean                        │
   │  │  ├─ hasUnlimitedGenerations: boolean      │
   │  │  └─ loading: boolean                      │
   │  └─ Component re-renders with new status     │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │  API Layer                                   │
   │                                              │
   │  GET /api/admin/status                       │
   │  ├─ Get server session                       │
   │  ├─ Call getAdminUser(userId)                │
   │  ├─ Return admin status                      │
   │  └─ Handle errors gracefully                 │
   │                                              │
   │  POST /api/admin/manage                      │
   │  ├─ Get server session                       │
   │  ├─ Verify requestor is admin                │
   │  ├─ Execute action:                          │
   │  │  ├─ grant: grantAdminPrivileges()         │
   │  │  ├─ remove: removeAdminPrivileges()       │
   │  │  └─ list: listAdminUsers()                │
   │  └─ Return result                            │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │  Admin Manager (lib/admin/adminManager.ts)   │
   │                                              │
   │  isAdminUser(userId)                         │
   │  ├─ Query: SELECT is_admin FROM users        │
   │  └─ Return boolean                           │
   │                                              │
   │  getAdminUser(userId)                        │
   │  ├─ Query: SELECT * FROM users WHERE admin   │
   │  └─ Return AdminUser object                  │
   │                                              │
   │  grantAdminPrivileges(admin, target)         │
   │  ├─ Verify admin is_admin = true             │
   │  ├─ UPDATE target user set admin flags       │
   │  └─ Return updated AdminUser                 │
   │                                              │
   │  removeAdminPrivileges(admin, target)        │
   │  ├─ Verify admin is_admin = true             │
   │  ├─ Prevent removing own privileges          │
   │  ├─ UPDATE target user set admin = false     │
   │  └─ Return boolean                           │
   │                                              │
   │  listAdminUsers()                            │
   │  ├─ Query: SELECT * FROM users WHERE admin   │
   │  └─ Return AdminUser[]                       │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │  Supabase (Database)                         │
   │                                              │
   │  All queries executed with:                  │
   │  ├─ supabaseAdmin (service role key)         │
   │  ├─ Row Level Security policies              │
   │  └─ Detailed error handling                  │
   └─────────────────────────────────────────────┘
```

## Rate Limit Bypass Flow

```
API Request (e.g., /api/mentor)
    │
    ├─ Get session
    │
    ├─ Get admin user
    │    │
    │    ├─ Query: is_admin FROM users
    │    └─ Return AdminUser or null
    │
    ├─ Check admin status
    │    │
    │    ├─ IF admin.has_unlimited_generations:
    │    │   └─ SKIP rate limit check ✅
    │    │
    │    └─ IF NOT admin:
    │        └─ Check rate limit:
    │            ├─ Count blueprints TODAY
    │            ├─ If count >= LIMIT:
    │            │   └─ Return 429 Too Many Requests ❌
    │            └─ Else: Continue ✅
    │
    └─ Process request normally
```

## Data Flow: First Sign-In with Admin Email

```
User visits app.com
    │
    ├─ Not signed in
    │
    └─ Redirects to /auth
        │
        ├─ Clicks "Sign in with Google"
        │
        ├─ Google OAuth flow
        │    └─ User selects account: admin@example.com
        │
        └─ Returns to NextAuth callback
            │
            ├─ authOptions.ts signIn callback executes
            │    │
            │    ├─ upsertUserProfile()
            │    │  ├─ Inserts/updates in users table:
            │    │  │  ├─ user_id: uuid
            │    │  │  ├─ email: admin@example.com
            │    │  │  ├─ name: from Google
            │    │  │  └─ created_at: now
            │    │  └─ Succeeds ✅
            │    │
            │    ├─ initializeAdminUser()
            │    │  │
            │    │  ├─ Read ADMIN_EMAIL from env
            │    │  │   └─ ADMIN_EMAIL=admin@example.com
            │    │  │
            │    │  ├─ Compare: user.email === ADMIN_EMAIL?
            │    │  │   └─ YES! ✅
            │    │  │
            │    │  └─ UPSERTinto users:
            │    │     ├─ is_admin: true
            │    │     ├─ is_pro: true
            │    │     ├─ has_unlimited_generations: true
            │    │     ├─ has_unlimited_exports: true
            │    │     └─ updated_at: now
            │    │        └─ Succeeds ✅
            │    │
            │    └─ Return true (allow sign-in)
            │
            └─ Redirect to /build
                │
                ├─ Session established
                │
                ├─ Components can call useAdminStatus()
                │
                └─ All admin features unlocked ✅
```

## Access Control Matrix

| Feature | Free User | Pro User | Admin User |
|---------|-----------|----------|-----------|
| Blueprint generation | 3/day | Unlimited | Unlimited |
| Blueprint viewing | ✅ | ✅ | ✅ |
| Copy/Save locally | ✅ | ✅ | ✅ |
| Markdown export | ✅ | ✅ | ✅ |
| PDF export | ❌ | ✅ | ✅ |
| GitHub export | ❌ | ✅ | ✅ |
| AI chat | 3/day | Unlimited | Unlimited |
| Blueprint saves | 5 | Unlimited | Unlimited |
| Access admin API | ❌ | ❌ | ✅ |
| Manage other admins | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Bypass all rate limits | ❌ | ❌ | ✅ |

## Error Handling Flow

```
Request to admin endpoint
    │
    ├─ getServerSession()
    │    └─ If null: Return 401 Unauthorized
    │
    ├─ isAdminUser()
    │    ├─ Database error: Log and return 500
    │    └─ Not admin: Return 403 Forbidden
    │
    ├─ Execute action
    │    ├─ Database error: Log and return 500
    │    ├─ Validation error: Return 400 Bad Request
    │    └─ Success: Return 200 with data
    │
    └─ Response sent to client
```

## File Dependencies

```
Frontend
    │
    ├─ hooks/useAdminStatus.ts
    │    └─ Depends on:
    │        ├─ next-auth useSession
    │        └─ /api/admin/status
    │
    └─ components/AdminDashboard.tsx (example)
         └─ Depends on:
              └─ hooks/useAdminStatus

Backend
    │
    ├─ lib/authOptions.ts
    │    └─ Depends on:
    │        ├─ lib/admin/adminManager.ts
    │        └─ lib/supabase.server.ts
    │
    ├─ lib/admin/adminManager.ts
    │    └─ Depends on:
    │        └─ lib/supabase.server.ts
    │
    ├─ app/api/admin/status/route.ts
    │    └─ Depends on:
    │        ├─ lib/admin/adminManager.ts
    │        ├─ lib/authOptions.ts
    │        └─ lib/supabase.server.ts
    │
    └─ app/api/admin/manage/route.ts
         └─ Depends on:
              ├─ lib/admin/adminManager.ts
              └─ lib/authOptions.ts

Database
    │
    └─ Supabase PostgreSQL
         └─ users table
              ├─ is_admin (new)
              ├─ has_unlimited_generations (new)
              └─ has_unlimited_exports (new)
```

## Security Layers

```
Request → Admin Endpoint
    │
    ├─ Layer 1: Authentication
    │   └─ getServerSession() validates NextAuth session
    │       └─ If no session: 401 Unauthorized
    │
    ├─ Layer 2: Authorization
    │   └─ isAdminUser() checks database is_admin flag
    │       └─ If not admin: 403 Forbidden
    │
    ├─ Layer 3: Validation
    │   └─ Request body validation (action, targetUserId)
    │       └─ If invalid: 400 Bad Request
    │
    ├─ Layer 4: Business Logic
    │   └─ Check constraints (can't remove own privileges)
    │       └─ If constraint violated: 400 Bad Request
    │
    └─ Layer 5: Data Access
        └─ Supabase RLS policies
            └─ Only admins can access/modify admin data
```

---

**Key Design Principles**:
- ✅ Stateless (no sessions)
- ✅ Role-based access control
- ✅ Principle of least privilege
- ✅ Defense in depth (multiple security layers)
- ✅ Comprehensive error handling
- ✅ Audit-friendly (all operations logged)
