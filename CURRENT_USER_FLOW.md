# Current VibeCode Mentor User Flow

## Overview
After a user generates a blueprint, VibeCode has a **two-tier system**: text blueprint output (free), and full app code generation (Pro only).

---

## Complete User Journey

### Phase 1: Authentication & Landing
```
User (unauthenticated)
    ↓
Lands on / (landing page)
    ↓
Clicks "Start Building Free"
    ↓
Redirected to /auth (sign in)
    ↓
Signs in with Google (NextAuth)
    ↓
Auto-redirected to /build (HomeClient component)
```

**Components Involved:**
- `app/page.tsx` - Landing page
- `/auth` - Authentication page (NextAuth)
- `app/home/page.tsx` - Wrapper
- `app/home/HomeClient.tsx` - Main build interface

---

## Phase 2: Blueprint Generation

### User Input
```
1. User enters project idea in textarea
   Example: "Build a REST API backend with authentication, database, and deployment guide"

2. User clicks "Generate Blueprint" button

3. Frontend calls POST /api/mentor
   Payload:
   {
     "projectIdea": "Build a REST API...",
     "userId": "user-uuid-123"
   }
```

### Code: HomeClient.tsx handleSubmit()
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // 1. Validate input
  if (!projectIdea.trim()) {
    setError('Please enter a project idea');
    return;
  }

  setLoading(true);
  setError('');
  setBlueprint('');

  try {
    // 2. Call API endpoint
    const response = await fetch('/api/mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectIdea,
        userId: user?.id || null,
      }),
    });

    // 3. Check for rate limiting
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        // Rate limit reached
        setError('Rate limit exceeded. Upgrade to Pro for unlimited!');
        openUpgradeModal({ source: 'limit_reached' });
        return;
      }
      throw new Error(errorData.error);
    }

    // 4. Store blueprint in state
    const data = await response.json();
    setBlueprint(data.blueprint);  // Markdown text
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

### Backend: /api/mentor API Route

What happens:
1. **Rate Limit Check** (stored in Supabase)
   - Free users: 3 blueprints per day
   - Pro users: Unlimited
   
2. **Mistral AI Call**
   - Sends prompt with project idea
   - Gets structured blueprint text
   
3. **Database Storage**
   - Saves blueprint to `blueprints` table
   - Logs activity

4. **Response**
   ```json
   {
     "blueprint": "# Project Architecture\n\n## Overview\n...",
     "timestamp": 1704000000000
   }
   ```

---

## Phase 3: Blueprint Display & Export Options

### What User Sees
The blueprint is rendered in `BlueprintOutput.tsx` with several action buttons:

```
[Save Blueprint] [Copy] [Export ▼]
                        ├─ PDF Export (Pro)
                        ├─ Create GitHub Repo (Pro)
                        └─ Download Markdown (Free)

[Full Blueprint Rendered as Markdown]

[🚀 Start Building Your App] or [⭐ Upgrade to Build Full Apps]
```

### Actions Available

#### Free Users Can:
1. **Copy Blueprint** - Copy entire blueprint to clipboard
2. **Save Blueprint** - Save to browser's localStorage (max 5)
3. **Download as Markdown** - Download .md file
4. **See "Upgrade" button** - Call-to-action for Pro features

#### Pro Users Can:
1. **Everything above, plus:**
2. **Export to PDF** - Download professional PDF document
3. **Create GitHub Repo** - Auto-create repository with blueprint
4. **AI Chat** - Ask questions about the blueprint
5. **Unlimited Saves** - No limit on saved blueprints

### Code: BlueprintOutput.tsx Key Features

```typescript
// Button visibility based on Pro status
const { isPro } = useProStatus();  // Checks from Supabase

// PDF Export (Pro only)
const handleExportPDF = async () => {
  if (!isPro) {
    showToastMessage('PDF export is a Pro feature. Upgrade to unlock!');
    return;
  }
  // ... generate PDF ...
};

// GitHub Export (Pro only)
const handleCreateGitHubRepo = async () => {
  if (!isPro) {
    showToastMessage('GitHub repo creation is a Pro feature. Upgrade to unlock!');
    return;
  }
  // ... create repo ...
};

// Save to Cloud (unlimited for Pro, limited for Free)
const handleSave = async () => {
  const currentSaves = getSavedBlueprints();
  
  if (!isPro && !canSaveBlueprint(currentSaves.length)) {
    showToastMessage(`Free limit: 5 saves. Upgrade to Pro for unlimited!`);
    return;
  }
  // ... save to database ...
};
```

---

## Phase 4: The "Build Full App" Decision Point

### What Happens When User Clicks "Build Full App"

#### If User is NOT Pro:
```
User clicks "Build Full App" button
            ↓
BuildFullAppButton.tsx detects: isPro = false
            ↓
1. Save blueprint to sessionStorage:
   {
     "blueprintToBuild": {
       "projectIdea": "...",
       "blueprint": "...",
       "timestamp": 1704000000000
     }
   }
            ↓
2. Open ProUpgradeModal
   Shows pricing tiers (Monthly/Annual)
            ↓
User clicks "Upgrade to Pro"
            ↓
Lemonsqueezy payment flow
            ↓
Payment successful
            ↓
Redirect to /payment/success
            ↓
After 5 seconds, redirect to /dashboard
```

#### If User IS Pro:
```
User clicks "Build Full App" button
            ↓
BuildFullAppButton.tsx detects: isPro = true
            ↓
1. Save blueprint to sessionStorage:
   {
     "blueprintToBuild": {
       "projectIdea": "...",
       "blueprint": "...",
       "timestamp": 1704000000000
     }
   }
            ↓
2. Redirect to /build-full-app page
            ↓
Page loads blueprint from sessionStorage
            ↓
Initiate code generation process
```

### Code: BuildFullAppButton.tsx

```typescript
const handleBuildFullApp = async () => {
  // Check if Pro
  if (!isPro) {
    // Save blueprint for after upgrade
    sessionStorage.setItem(
      'blueprintToBuild',
      JSON.stringify({
        projectIdea,
        blueprint,
        timestamp: Date.now(),
      })
    );
    
    // Show upgrade modal
    openUpgradeModal({ source: 'build_full_app' });
    return;  // User must upgrade first
  }

  // If already Pro, proceed directly
  startBuild();
};

const startBuild = async () => {
  if (!session?.user?.id) return;

  setIsLoading(true);

  try {
    // Store blueprint for /build-full-app page
    sessionStorage.setItem(
      'blueprintToBuild',
      JSON.stringify({
        projectIdea,
        blueprint,
        timestamp: Date.now(),
      })
    );

    // Navigate to full app builder
    router.push('/build-full-app');
  } finally {
    setIsLoading(false);
  }
};
```

---

## Complete Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER JOURNEY FLOW                             │
└─────────────────────────────────────────────────────────────────┘

                      START
                        │
                        ↓
            ┌──────────────────────┐
            │   Landing Page       │
            │   (app/page.tsx)     │
            └──────────┬───────────┘
                       │ Click "Start Building"
                       ↓
            ┌──────────────────────┐
            │   Auth Sign-In       │
            │   (NextAuth)         │
            └──────────┬───────────┘
                       │ Authenticated
                       ↓
        ┌─────────────────────────────┐
        │   Build/Home Page           │
        │   (app/home/HomeClient.tsx) │
        │                             │
        │  [Enter Project Idea]       │
        │  [Generate Blueprint BTN]   │
        └─────────┬───────────────────┘
                  │ Click "Generate"
                  ↓
        ┌─────────────────────────────┐
        │   POST /api/mentor          │
        │   (Mistral AI)              │
        │                             │
        │ 1. Rate limit check         │
        │ 2. Generate blueprint       │
        │ 3. Save to DB               │
        │ 4. Return markdown          │
        └─────────┬───────────────────┘
                  │ Blueprint generated
                  ↓
        ┌─────────────────────────────┐
        │  Blueprint Output           │
        │  (BlueprintOutput.tsx)      │
        │                             │
        │  [Save] [Copy] [Export ▼]  │
        │  ┌──────────────────────┐   │
        │  │  Full Markdown Text  │   │
        │  │  (rendered nice)     │   │
        │  └──────────────────────┘   │
        │                             │
        │  [Build Full App Button]    │
        └─────────┬───────────────────┘
                  │ Click "Build"
                  ↓
        ┌──────────────────────────────┐
        │  Check Pro Status            │
        └────┬──────────────────┬───────┘
             │                  │
         NOT Pro           IS Pro
             │                  │
             ↓                  ↓
    ┌────────────────┐  ┌──────────────────┐
    │ Show Upgrade   │  │ Start Building   │
    │ Modal          │  │ /build-full-app  │
    │                │  │                  │
    │ [Pay $5/mo]    │  │ [Generate Code]  │
    └────┬───────────┘  └──────────────────┘
         │ Payment Success
         ↓
    ┌──────────────────────┐
    │  /payment/success    │
    │  (5 sec countdown)   │
    └──────────┬───────────┘
              │ Redirect
              ↓
         [Dashboard or Build Page]

```

---

## Current Database Flow

### When Blueprint is Generated

**1. Check Rate Limits:**
```sql
SELECT COUNT(*) FROM blueprints 
WHERE user_id = $1 
AND created_at > NOW() - INTERVAL '1 day'
AND is_pro_user = false
```
- If count >= 3 and NOT Pro → Return 429 error
- Else → Continue

**2. Save Blueprint:**
```sql
INSERT INTO blueprints (
  user_id,
  vibe,
  blueprint,
  created_at
) VALUES (
  $1,
  $2,
  $3,
  NOW()
)
```

**3. Return Response:**
```json
{
  "blueprint": "# Project Architecture\n\n...",
  "id": 12345,
  "timestamp": 1704000000000
}
```

### When User Saves Blueprint

**Local Save (All Users):**
- Stored in browser `localStorage`
- Limited to 5 for free users
- Stored as JSON: `{ id, vibe, blueprint, timestamp }`

**Cloud Save (If Logged In):**
```sql
INSERT INTO user_blueprints (
  user_id,
  blueprint_id,
  saved_at
) VALUES ($1, $2, NOW())
```

---

## State Management

### HomeClient.tsx Local State
```typescript
const [projectIdea, setProjectIdea] = useState('');      // User input
const [blueprint, setBlueprint] = useState('');          // Generated blueprint
const [loading, setLoading] = useState(false);           // Loading state
const [error, setError] = useState('');                  // Error message
```

### Session Storage (Between Pages)
```typescript
// Loaded blueprint from history
sessionStorage.setItem('loadedBlueprint', JSON.stringify({
  vibe: projectIdea,
  blueprint: blueprint
}));

// Blueprint to build (stored before redirect)
sessionStorage.setItem('blueprintToBuild', JSON.stringify({
  projectIdea,
  blueprint,
  timestamp: Date.now()
}));
```

### Supabase Auth State
```typescript
const { data: session, status } = useSession();
// session.user.id
// session.user.email
// session.user.name
```

---

## Subscription Check Flow

### How Pro Status is Determined

**Hook: `useProStatus()`**
```typescript
export function useProStatus() {
  const { data: session } = useSession();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      setIsPro(false);
      return;
    }

    // Fetch from Supabase
    const fetchProStatus = async () => {
      const { getProStatusFromCloud } = await import('@/lib/supabaseDB');
      const cloudProStatus = await getProStatusFromCloud(session.user.id);
      setIsPro(cloudProStatus);
    };

    fetchProStatus();
  }, [session?.user?.id]);

  return { isPro };
}
```

**Supabase Query:**
```sql
SELECT is_pro FROM users WHERE id = $1
```

Returns:
- `true` → User has active subscription
- `false` → Free user or subscription expired

---

## Error Handling

### Rate Limit Error (429)
```typescript
if (response.status === 429) {
  setError('Rate limit exceeded. Upgrade to Pro for unlimited!');
  openUpgradeModal({ source: 'limit_reached' });
}
```

### Generation Error (5xx)
```typescript
const errorData = await response.json();
throw new Error(errorData.error || 'Failed to generate blueprint');
```

### Network Error
```typescript
catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}
```

---

## Summary: Current Workflow

```
┌─ FREE USER PATH ────────────────────────┐
│ 1. Generate blueprint              [✓]  │
│ 2. View blueprint                  [✓]  │
│ 3. Copy blueprint                  [✓]  │
│ 4. Download as Markdown            [✓]  │
│ 5. Save to browser (max 5)         [✓]  │
│ 6. Share blueprint                 [✓]  │
│ 7. Build full app?                 [✗]  │
│    → See "Upgrade to Pro" button       │
└────────────────────────────────────────┘

┌─ PRO USER PATH ─────────────────────────┐
│ 1. Generate blueprint              [✓]  │
│ 2. View blueprint                  [✓]  │
│ 3. Copy blueprint                  [✓]  │
│ 4. Export as PDF                   [✓]  │
│ 5. Download as Markdown            [✓]  │
│ 6. Create GitHub repo              [✓]  │
│ 7. Save unlimited                  [✓]  │
│ 8. Share & collaborate             [✓]  │
│ 9. Build full app                  [✓]  │
│    → Redirects to /build-full-app      │
└────────────────────────────────────────┘
```

---

## Files Involved

### Frontend Components
- `app/page.tsx` - Landing page
- `app/home/page.tsx` - Home wrapper
- `app/home/HomeClient.tsx` - Main blueprint generator UI
- `components/BlueprintOutput.tsx` - Blueprint display & actions
- `components/BuildFullAppButton.tsx` - Pro/Free decision point
- `components/ProUpgradeModal.tsx` - Upgrade modal

### Backend Routes
- `/api/mentor/route.ts` - Blueprint generation (Mistral AI)
- `/api/auth/*` - NextAuth authentication

### Utilities & Hooks
- `hooks/useProStatus.ts` - Check if user is Pro
- `hooks/useProUpgradeModal.ts` - Open upgrade modal
- `lib/supabaseDB.ts` - Database operations
- `utils/pro.ts` - Pro-specific utilities

### Database
- `blueprints` table - Store generated blueprints
- `users` table - User info & Pro status
- `activity_logs` (optional) - Track user actions

---

**Current Status:** VibeCode Mentor is a **text blueprint generator with optional code generation** (Pro only). Users can easily generate comprehensive project blueprints for free, with the option to upgrade to Pro for full app code generation and advanced export features.
