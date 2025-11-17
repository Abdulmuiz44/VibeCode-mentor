# Migration from Firebase Auth to NextAuth.js + Supabase

This document describes the authentication migration completed on this project.

## What Changed

### Authentication System
- **Before**: Firebase Authentication with Google Sign-In
- **After**: NextAuth.js with Google Provider + Supabase for user storage

### Key Changes

1. **Removed Firebase Auth**
   - Deleted all Firebase authentication code
   - Removed `auth`, `googleProvider`, `signInWithGoogle()`, and `logOut()` from `lib/firebase.ts`
   - Kept Firestore functions for backward compatibility with existing blueprint/prompt storage

2. **Added NextAuth.js**
   - Created `/app/api/auth/[...nextauth]/route.ts` for authentication handling
   - Added Google OAuth provider configuration
   - Implemented session management with JWT tokens

3. **Added Supabase**
   - Created `/lib/supabase.ts` for database operations
   - User profiles stored in Supabase `users` table
   - Automatic user creation/update on sign-in

4. **Updated Components**
   - `AuthButton`: Now uses `useSession()` and `signIn()`/`signOut()` from NextAuth
   - `AuthProvider` → `NextAuthProvider`: New session provider wrapper
   - All pages updated to use `useSession()` instead of Firebase `useAuth()`

5. **User ID Changes**
   - **Before**: `user.uid` (Firebase)
   - **After**: `user.id` (NextAuth)
   - All references updated throughout the codebase

## Environment Variables

### Removed
```bash
# Firebase Configuration (OLD - NO LONGER NEEDED FOR AUTH)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Added
```bash
# NextAuth Configuration (NEW)
NEXTAUTH_SECRET=your_generated_secret_here
AUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration (NEW)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Supabase Configuration (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Migration Steps for Deployment

### 1. Set up Supabase Database

Run the SQL in `SUPABASE_SETUP.md` to create the users table.

### 2. Configure Google OAuth

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`

### 3. Generate Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32
```

### 4. Update Vercel Environment Variables

Add these to your Vercel project settings:

- `NEXTAUTH_SECRET` (from step 3)
- `AUTH_SECRET` (same as NEXTAUTH_SECRET)
- `NEXTAUTH_URL` (your production URL)
- `GOOGLE_CLIENT_ID` (from step 2)
- `GOOGLE_CLIENT_SECRET` (from step 2)
- `NEXT_PUBLIC_SUPABASE_URL` (from Supabase dashboard)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase dashboard)

### 5. Deploy

Push your changes and Vercel will automatically deploy with the new authentication system.

## Code Changes Required for Future Features

### Accessing the Current User

**Before (Firebase):**
```typescript
import { useAuth } from '@/context/AuthContext';

const { user, isPro } = useAuth();
const userId = user?.uid;
```

**After (NextAuth):**
```typescript
import { useSession } from 'next-auth/react';
import { getProStatus } from '@/utils/pro';

const { data: session } = useSession();
const user = session?.user;
const userId = user?.id;

// Get Pro status from local storage
const [isPro, setIsPro] = useState(false);
useEffect(() => {
  const proStatus = getProStatus();
  setIsPro(proStatus.isPro);
}, []);
```

### Sign In / Sign Out

**Before (Firebase):**
```typescript
import { signInWithGoogle, logOut } from '@/lib/firebase';

await signInWithGoogle();
await logOut();
```

**After (NextAuth):**
```typescript
import { signIn, signOut } from 'next-auth/react';

await signIn('google');
await signOut();
```

### Server-Side Session

For API routes or server components:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const session = await getServerSession(authOptions);
const userId = session?.user?.id;
```

## Data Migration

### User Data

- **No automatic migration**: Existing Firebase users need to sign in again
- User IDs will be different (Google OAuth IDs vs Firebase UIDs)
- Consider mapping old Firebase UIDs to new NextAuth IDs if you need to preserve user data

### Blueprint & Prompt Storage

- Still using Firestore (Firebase) for now
- These can be migrated to Supabase in a future update
- Current implementation is backward compatible

## Testing

1. **Local Testing**
   - Set up local `.env.local` with all required variables
   - Run `npm run dev`
   - Test sign-in flow
   - Verify user created in Supabase

2. **Production Testing**
   - Deploy to Vercel
   - Test with production Google OAuth credentials
   - Verify users are stored correctly

## Rollback Plan

If issues arise, you can rollback by:

1. Checkout the previous commit before this migration
2. Restore Firebase environment variables
3. Redeploy to Vercel

However, note that new users created during the NextAuth period won't be available in the Firebase system.

## Benefits of This Migration

1. **Better DX**: NextAuth provides a cleaner API for authentication
2. **Type Safety**: Better TypeScript support with NextAuth
3. **Database Control**: User data in Supabase gives more control
4. **Scalability**: Easier to add more providers (GitHub, Email, etc.)
5. **Modern Stack**: NextAuth is the recommended solution for Next.js apps

## Known Issues

1. **Pro Status**: Currently stored in local storage. Should be migrated to Supabase.
2. **Blueprint Storage**: Still using Firestore. Can be migrated to Supabase later.
3. **User Migration**: No automatic migration from Firebase to NextAuth users.

## Future Improvements

1. Move Pro status to Supabase
2. Migrate blueprint and prompt storage from Firestore to Supabase
3. Add email verification
4. Add password-based authentication option
5. Implement user profile editing
