# URGENT: RLS Fix Instructions

The infinite recursion error in the users table RLS is preventing app generation. 

## Quick Fix (Temporary)

Run this SQL in Supabase SQL Editor to **disable RLS completely** on the users table:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';
```

## Steps:
1. Go to Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy/paste the SQL above
4. Click **Run**
5. You should see: `rowsecurity = false` for users table
6. Restart your dev server: `npm run dev`
7. Try building the app again

---

## Why This Works

The RLS policies on the users table are causing infinite recursion when the anon client tries to query `is_pro` status. Disabling RLS:
- Allows the client to read/write freely
- Relies on session-based checks in the API instead
- Server-side operations still use service role (which is protected)

## Permanent Solution (Later)

Once the app is working, we can implement proper RLS policies using:
- Disable RLS on users table (simpler, client handles access control)
- OR use row-level security with simple, non-recursive conditions
- Use middleware to validate access on the server side

The current issue is that the RLS policy itself is broken, so removing it temporarily is the fastest fix.
