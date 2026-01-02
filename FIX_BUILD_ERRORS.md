# Fix for Build Errors - Database Column & RLS Issues

## Errors Fixed

### 1. **Blueprint Column Mismatch Error**
**Error**: `Could not find the 'blueprint' column of 'blueprints' in the schema cache`

**Root Cause**: The code was trying to insert a `blueprint` column that doesn't exist in the schema. The actual columns are:
- `content` - stores the blueprint content
- `project_idea` - stores the project idea

**Fixed in**: `lib/supabaseDB.ts`
- **Line 10**: Changed `blueprint: blueprint.blueprint` to `content: blueprint.blueprint`
- **Line 75**: Changed `blueprint: b.blueprint` to `content: b.blueprint`
- Also added `project_idea: 'Generated Blueprint'` to both inserts

---

### 2. **Infinite Recursion in Users RLS Policy**
**Error**: `infinite recursion detected in policy for relation "users"`

**Root Cause**: The RLS policy on the users table was causing recursive lookups when trying to verify `is_pro` status.

**Fix Applied**: Created migration file `supabase/migrations/fix_users_rls_recursion.sql`

**Actions Required**:
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Open `supabase/migrations/fix_users_rls_recursion.sql`
4. Copy and paste the SQL into the editor
5. Click **Execute**

This will:
- Drop all existing users table policies
- Recreate them without recursion issues
- Allow service role bypass for admin operations

---

## How to Apply the Fixes

### Option A: Automatic via Supabase Migrations
```bash
supabase db push
```

### Option B: Manual SQL Application
1. Login to Supabase Dashboard
2. Go to SQL Editor
3. Run the migration file: `supabase/migrations/fix_users_rls_recursion.sql`

---

## Testing After Fixes

1. Clear browser cache/local storage
2. Restart dev server: `npm run dev`
3. Try building the app again
4. Check console for the same errors - they should be gone

---

## Expected Column Structure

**blueprints table**:
- `id` (uuid)
- `user_id` (text)
- `project_idea` (text) - describes the project
- `content` (text) - the actual blueprint markdown
- `vibe` (text) - styling preference
- `created_at` (timestamp)

---

## Files Modified

1. ✅ `lib/supabaseDB.ts` - Fixed blueprint column references
2. ✅ `supabase/migrations/fix_users_rls_recursion.sql` - New migration for RLS fix

