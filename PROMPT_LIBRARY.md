# Prompt Library Feature

## Overview
The Prompt Library displays the top 10 most popular project vibes from the community and allows Pro users to save custom prompts for quick reuse.

## Features

### 1. **Top 10 Popular Vibes** (All Users)
- Displays the most-used project ideas from analytics
- Data pulled from Vercel KV `stats:vibes` sorted set
- Shows usage count for each vibe
- Click to pre-fill home page textarea
- Auto-focus on textarea after selection

### 2. **Custom Prompts** (Pro Users Only)
- Save unlimited custom prompts to Firestore
- Each prompt has:
  - Title (short description)
  - Full prompt text
  - Timestamp (for sorting)
- Delete custom prompts
- Use custom prompts (pre-fills home page)
- Synced across devices via Firebase

### 3. **Free User Experience**
- View top 10 popular vibes
- Click to use any vibe
- See upgrade CTA for custom prompts
- Encouraged to sign in for future features

## User Flows

### Free User (Not Signed In)
1. Visit `/prompts`
2. See top 10 popular vibes
3. Click vibe → redirected to home with pre-filled text
4. See CTA: "Sign In to Save Custom Prompts"

### Free User (Signed In)
1. Visit `/prompts`
2. See top 10 popular vibes
3. Click vibe → redirected to home with pre-filled text
4. See CTA: "Upgrade to Pro to Save Custom Prompts"

### Pro User
1. Visit `/prompts`
2. See "Your Custom Prompts" section at top
3. Click "+ Add Custom Prompt"
4. Fill title and prompt text
5. Save → appears in custom prompts list
6. Click "Use This Prompt" → redirected to home with pre-filled text
7. Hover and click delete icon to remove
8. See top 10 popular vibes below custom prompts

## Technical Implementation

### API Endpoints

#### `GET /api/prompts`
Returns top vibes from analytics:
```json
{
  "vibes": [
    { "vibe": "build a todo app", "count": 45 },
    { "vibe": "ai chatbot", "count": 38 },
    ...
  ]
}
```

### Firebase Functions

#### `saveCustomPrompt(userId, prompt)`
```typescript
interface CustomPrompt {
  id: string;           // timestamp-based
  title: string;        // short name
  prompt: string;       // full text
  timestamp: number;    // for sorting
}
```

Stores in: `users/{uid}/prompts/{promptId}`

#### `getCustomPrompts(userId)`
Returns all custom prompts for user, sorted by timestamp (newest first).

#### `deleteCustomPrompt(userId, promptId)`
Deletes specific custom prompt.

### State Management

#### sessionStorage Keys
- `selectedPrompt` - Stores selected prompt text temporarily
- Cleared after reading on home page
- Enables seamless navigation flow

#### Home Page Integration
```typescript
useEffect(() => {
  const selectedPrompt = sessionStorage.getItem('selectedPrompt');
  if (selectedPrompt) {
    setProjectIdea(selectedPrompt);
    sessionStorage.removeItem('selectedPrompt');
    document.getElementById('projectIdea')?.focus();
  }
}, []);
```

## UI Components

### Vibe Card (Popular)
```
┌─────────────────────────────────┐
│ #1        45 uses                │
│                                  │
│ build a todo app with react     │
│                                  │
│ [Use This Vibe →]               │
└─────────────────────────────────┘
```

### Custom Prompt Card (Pro)
```
┌─────────────────────────────────┐
│ E-commerce App          [×]      │
│                                  │
│ Build a full-stack ecommerce... │
│                                  │
│ [Use This Prompt →]             │
└─────────────────────────────────┘
```

### Add Custom Prompt Modal
```
┌─────────────────────────────────┐
│ Create Custom Prompt      [×]   │
├─────────────────────────────────┤
│ Prompt Title                    │
│ [___________________________]   │
│                                  │
│ Prompt Text                     │
│ [                              ]│
│ [                              ]│
│ [                              ]│
│                                  │
│ [Cancel]  [Save Prompt]         │
└─────────────────────────────────┘
```

## Navigation Integration

Added to header navigation:
```tsx
<Link href="/prompts">
  <svg>📚 Archive Icon</svg>
  Prompts
</Link>
```

Order: [UsageCounter] [ProBadge] [Prompts] [History] [AuthButton]

## Data Flow

### Popular Vibes
1. User generates blueprint with vibe
2. API logs to `stats:vibes` sorted set
3. Vercel KV increments score
4. `/api/prompts` fetches top 10
5. Prompts page displays ranked list

### Custom Prompts
1. Pro user creates custom prompt
2. Saved to Firestore `users/{uid}/prompts/`
3. Listed in prompts page
4. Synced across all user's devices
5. Persists indefinitely (no expiry)

## Firestore Security Rules

Add to `firestore.rules`:
```
match /users/{userId}/prompts/{promptId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## Benefits

### For Users
- **Discover popular ideas**: See what the community builds
- **Quick templates**: One-click to start building
- **Personalized library**: Pro users build custom collection
- **Cross-device sync**: Access prompts anywhere

### For Product
- **Engagement**: Users explore more vibes
- **Conversion**: Custom prompts drive Pro upgrades
- **Retention**: Personal library keeps users coming back
- **Community**: Shows trending project types

## Metrics to Track

1. **Prompts page visits**
   - Track: pageviews on `/prompts`
   - Goal: High traffic = strong interest

2. **Vibe click-through rate**
   - Track: Clicks on popular vibes
   - Goal: >30% CTR indicates value

3. **Custom prompts created**
   - Track: Pro users creating prompts
   - Goal: Average 3+ prompts per Pro user

4. **Custom prompt usage**
   - Track: How often users reuse saved prompts
   - Goal: 40%+ reuse rate

## Future Enhancements

- [ ] Share custom prompts with community
- [ ] Upvote/downvote popular vibes
- [ ] Search/filter prompts by category
- [ ] Duplicate prompts (fork & modify)
- [ ] Export prompts as JSON
- [ ] Import prompts from URL
- [ ] Organize prompts into folders
- [ ] Add tags to custom prompts
- [ ] Trending vibes (daily/weekly/monthly)
- [ ] "Featured" vibes curated by team

## Testing

### Manual Test Cases

**Free User (Not Signed In)**
1. ✅ Visit `/prompts` - see popular vibes
2. ✅ Click vibe - redirected to home with pre-filled text
3. ✅ See "Sign In" CTA
4. ✅ No custom prompts section visible

**Free User (Signed In)**
1. ✅ Visit `/prompts` - see popular vibes
2. ✅ Click vibe - redirected to home with pre-filled text
3. ✅ See "Upgrade to Pro" CTA
4. ✅ No custom prompts section visible

**Pro User**
1. ✅ Visit `/prompts` - see custom prompts section
2. ✅ Click "+ Add Custom Prompt" - modal opens
3. ✅ Fill form and save - prompt appears in list
4. ✅ Click "Use This Prompt" - redirected to home
5. ✅ Home textarea pre-filled with prompt
6. ✅ Click delete icon - prompt removed
7. ✅ Refresh page - custom prompts persist
8. ✅ See popular vibes below custom section

### Edge Cases
- No popular vibes yet → "Be the first" message
- No custom prompts → "Create your first one" CTA
- Long prompt text → Truncated with line-clamp-3
- KV not configured → Empty popular vibes (graceful)

## Success Metrics

- **Adoption**: 40%+ of Pro users create custom prompts
- **Engagement**: 25%+ of sessions include prompts visit
- **Conversion**: Custom prompts feature drives 15%+ Pro upgrades
- **Retention**: Users with custom prompts have 2x retention

## Deployment Checklist

- ✅ Code committed and pushed
- ✅ Build passing
- ⏳ Update Firestore rules in Firebase Console
- ⏳ Deploy to Vercel
- ⏳ Test Pro user flow live
- ⏳ Monitor analytics for adoption

## Related Features

- **Rate Limiting**: Popular vibes show demand patterns
- **Admin Dashboard**: View top vibes analytics
- **Pro Subscription**: Custom prompts are Pro feature
- **Firebase Sync**: Custom prompts sync across devices

---

**Status**: ✅ Complete and production-ready
