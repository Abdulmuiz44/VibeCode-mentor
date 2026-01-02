# Admin System - Quick Reference Card

## ⚡ 30 Second Setup

1. **Add to `.env.local`:**
   ```env
   ADMIN_EMAIL=your-email@example.com
   ```

2. **Run migration:** (Supabase Dashboard → SQL Editor)
   ```bash
   # Copy contents of supabase/migrations/add_admin_fields.sql
   ```

3. **Sign in** with your `ADMIN_EMAIL` → Done! ✅

## 🔑 Key Files

| File | What it does |
|------|--------------|
| `lib/admin/adminManager.ts` | Core admin logic |
| `lib/authOptions.ts` | Auto-init on sign-in |
| `hooks/useAdminStatus.ts` | Check status in components |
| `app/api/admin/status/route.ts` | Get admin status API |
| `app/api/admin/manage/route.ts` | Manage admins API |

## 📋 Admin Checklist

- [ ] Set `ADMIN_EMAIL` in `.env.local`
- [ ] Run database migration
- [ ] Sign in with admin email
- [ ] Verify `/api/admin/status` shows `isAdmin: true`
- [ ] Test unlimited blueprint generation
- [ ] Test unlimited exports
- [ ] Promote other users to admin (optional)

## 🎯 Use Cases

### Check Admin Status in Component
```typescript
const admin = useAdminStatus();
if (admin.isAdmin) { /* show admin UI */ }
```

### Bypass Rate Limit in API
```typescript
const admin = await getAdminUser(userId);
if (!admin?.has_unlimited_generations) {
  // Apply rate limit
}
```

### Promote User to Admin
```javascript
fetch('/api/admin/manage', {
  method: 'POST',
  body: JSON.stringify({
    action: 'grant',
    targetUserId: 'user-uuid'
  })
});
```

### List All Admins
```javascript
fetch('/api/admin/manage').then(r => r.json());
```

## 🔧 API Endpoints

### `GET /api/admin/status`
```json
{
  "isAdmin": true,
  "isPro": true,
  "hasUnlimitedGenerations": true,
  "hasUnlimitedExports": true
}
```

### `POST /api/admin/manage`
```json
{
  "action": "grant" | "remove" | "list",
  "targetUserId": "optional"
}
```

## 💡 Quick Tips

| Task | How to do it |
|------|--------------|
| Check if admin | `useAdminStatus()` hook |
| Bypass rate limit | Check `admin?.has_unlimited_generations` |
| Show admin UI | `if (admin.isAdmin)` |
| Promote user | `/api/admin/manage` with `grant` action |
| Remove admin | `/api/admin/manage` with `remove` action |
| See all admins | `/api/admin/manage?action=list` |

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No admin status | Check exact email match in `.env.local` |
| Still rate limited | Verify migration ran, refresh page |
| Can't promote users | Verify your own `isAdmin` is true |
| API 403 error | User must be admin to use admin endpoints |

## 📚 Full Documentation

- Complete guide: `ADMIN_SETUP_GUIDE.md`
- Technical docs: `lib/admin/ADMIN_SYSTEM.md`
- Integration examples: `lib/admin/INTEGRATION_EXAMPLES.md`
- Implementation: `ADMIN_SYSTEM_SUMMARY.md`

## 🚀 Next Steps

```bash
# 1. Set environment variable
# 2. Run migration
# 3. Sign in
# 4. Start using admin features!
```

---

**Questions?** Check the full docs in `lib/admin/ADMIN_SYSTEM.md`
