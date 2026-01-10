# Blueprint Fetch Error Fix Guide

## Problem
Error: `Supabase getBlueprints error: {}`

The blueprints are not being fetched from Supabase. An empty error object indicates the query is likely being blocked by Row Level Security (RLS) policies.

## Root Cause Analysis

The error happens because:
1. **RLS Policy Mismatch**: The user ID in the session doesn't match the format stored in the `blueprints` table
2. **User ID Type Mismatch**: `user_id` might be stored as UUID but being queried as TEXT
3. **Missing User Data**: The user hasn't been created in the `users` table, so blueprints can't be linked

## Solution Steps

### Step 1: Apply the RLS Migration
Run this SQL in your Supabase SQL Editor:

```bash
-- Copy and paste the contents of:
supabase/migrations/20260110_fix_blueprints_rls_final.sql
```

This ensures:
- RLS policies are properly configured
- User ID type casting is correct
- Indices are created for performance

### Step 2: Check Browser Console Logs
After applying the migration and reloading the page:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for log messages like:
   ```
   "Fetching blueprints for user: abc123..."
   "Found 3 blueprints for user abc123"
   ```
   OR
   ```
   "Supabase getBlueprints error: { message: "...", code: "...", hint: "..." }"
   ```

The improved error logging will now show:
- The exact user ID being queried
- Error message, code, and hints from Supabase
- Number of blueprints found

### Step 3: Verify User Exists in Database
In Supabase Dashboard:

1. Go to **SQL Editor**
2. Run:
   ```sql
   SELECT user_id, email, created_at FROM users WHERE user_id = '<your_user_id>';
   ```
   Replace `<your_user_id>` with the ID from the console logs

3. If no results, the user wasn't created during sign-in

### Step 4: Check Blueprints Table Structure
Run in Supabase SQL Editor:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'blueprints'
ORDER BY ordinal_position;

-- Check if blueprints exist
SELECT user_id, vibe, created_at FROM blueprints LIMIT 10;

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'blueprints';
```

### Step 5: Verify RLS Policies
Expected policies should be:
- `blueprints_select_own` (SELECT)
- `blueprints_insert_own` (INSERT)
- `blueprints_update_own` (UPDATE)
- `blueprints_delete_own` (DELETE)
- `blueprints_service_role` (ALL, for service role)

If any are missing, the migration didn't apply correctly.

### Step 6: Test a Manual Blueprint Save
On the Build page:
1. Create a blueprint
2. Click Save
3. Check console for messages
4. If save succeeds but fetch fails, it's a SELECT policy issue

## Common Error Messages and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `{}` (empty error) | RLS blocking the query | Re-apply RLS migration |
| `No blueprints found` | No blueprints saved yet | Create one on Build page |
| `user_id type mismatch` | ID format doesn't match | Check user ID format in logs |
| `relation "blueprints" does not exist` | Table not created | Run schema migration |

## Debugging Checklist

- [ ] Check browser console shows user ID being fetched
- [ ] Verify user exists in `users` table
- [ ] Confirm blueprints exist in `blueprints` table
- [ ] Check RLS policies are listed in `pg_policies`
- [ ] Test creating a new blueprint
- [ ] Try saving and immediately refreshing the page

## Advanced: Disable RLS Temporarily (Testing Only)

If you need to test without RLS:

```sql
ALTER TABLE blueprints DISABLE ROW LEVEL SECURITY;
```

Then test if blueprints load. If they do, the issue is definitely RLS policies.

**Re-enable RLS after testing:**
```sql
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
```

## Next Steps

1. **Check Console Logs**: Reload the history page and check what user ID is being used
2. **Run the Migration**: Apply `20260110_fix_blueprints_rls_final.sql`
3. **Verify in Database**: Confirm users and blueprints exist
4. **Test Again**: Reload and check console logs

If the issue persists after these steps, share the full error message from the console logs.
