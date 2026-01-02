# Understanding: How VibeCode Works Today (Current Flow)

## TL;DR - The Quick Version

**What happens after a user generates a blueprint:**

```
1. User enters project idea
   ↓
2. AI (Mistral) generates markdown blueprint (~30 seconds)
   ↓
3. Blueprint displays in nice formatted view
   ↓
4. User sees buttons:
   - [Copy]     → Copy to clipboard
   - [Save]     → Save locally (5 max for free)
   - [Export ▼] → PDF, GitHub, Markdown
   ↓
5. User sees "Build Full App" button:
   - If FREE:  → "Upgrade to Pro" modal
   - If PRO:   → Redirect to /build-full-app page
   ↓
   DONE (for free users) or Continue to code generation (pro users)
```

---

## The Complete Current Flow (Detailed)

### Step 1: User Lands on App
```
https://vibecodeementor.com/
    ↓ (if not authenticated)
/auth (NextAuth Google Sign-In)
    ↓ (after signing in)
/build (The main generator page - HomeClient.tsx)
```

### Step 2: User Generates Blueprint

**What they do:**
```
1. See textarea: "Describe your project idea"
2. Type example: "Build a REST API with authentication and database"
3. Click "Generate Blueprint" button
4. Wait ~30 seconds
```

**What happens behind the scenes:**
```typescript
// Frontend (HomeClient.tsx)
POST /api/mentor {
  projectIdea: "Build a REST API...",
  userId: "user-123"
}

// Backend (/api/mentor/route.ts)
1. Check rate limit:
   - SELECT COUNT(*) FROM blueprints WHERE user_id = ? AND created_at > NOW() - 1 DAY
   - If count >= 3 AND user NOT pro → 429 error (show upgrade modal)
   
2. Call Mistral AI API:
   - Enhanced prompt with project idea
   - Get structured blueprint back (markdown format)
   
3. Save to database:
   - INSERT INTO blueprints (user_id, vibe, blueprint) VALUES (...)
   
4. Return to frontend:
   {
     "blueprint": "# Project Architecture\n\n## Overview\n...",
     "id": 12345
   }

// Frontend receives blueprint
- Update state: setBlueprint(data.blueprint)
- Component re-renders with new content
```

### Step 3: User Sees Blueprint Displayed

**The BlueprintOutput component shows:**

```
┌─────────────────────────────────────────────┐
│                                             │
│  [💾 Save]  [📋 Copy]  [📤 Export ▼]       │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  # Project Architecture                │  │
│  │                                       │  │
│  │  ## Overview                          │  │
│  │  Build a REST API backend with...    │  │
│  │                                       │  │
│  │  ## Tech Stack                        │  │
│  │  - Node.js                            │  │
│  │  - Express                            │  │
│  │  - PostgreSQL                         │  │
│  │  - JWT Authentication                 │  │
│  │                                       │  │
│  │  ## Architecture                      │  │
│  │  ...more content...                   │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ 🚀 Start Building Your App             ││
│  │                                         ││
│  │ Generate production-ready code with  ││
│  │ database schema and GitHub integration││
│  │                                         ││
│  │ [⭐ Upgrade to Pro] OR [Build Full App]││
│  └─────────────────────────────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

**Blueprint buttons do:**
- **Save** → Store in browser localStorage + Supabase (if cloud)
- **Copy** → Copy entire blueprint to clipboard
- **Export ▼** → Download as PDF, MD, or push to GitHub (Pro only)

### Step 4: The Critical Decision Point - Build Full App Button

**The code behind "Build Full App":**

```typescript
// BuildFullAppButton.tsx
const { isPro } = useProStatus();  // Checks Supabase: SELECT is_pro FROM users WHERE id = ?

if (!isPro) {
  // FREE USER PATH
  // 1. Save blueprint to sessionStorage
  sessionStorage.setItem('blueprintToBuild', JSON.stringify({
    projectIdea: "Build a REST API...",
    blueprint: "# Project Architecture...",
    timestamp: 1704000000000
  }));
  
  // 2. Show upgrade modal
  openUpgradeModal({ source: 'build_full_app' });
  
  // 3. User must pay $5/month to continue
  // 4. After payment → redirect to /payment/success
  // 5. Then → redirect to /dashboard (new hub)
} else {
  // PRO USER PATH
  // 1. Save blueprint to sessionStorage
  sessionStorage.setItem('blueprintToBuild', JSON.stringify({...}));
  
  // 2. Redirect immediately to /build-full-app
  router.push('/build-full-app');
  
  // 3. That page will:
  //    - Load blueprint from sessionStorage
  //    - Parse it into structure
  //    - Generate 40-60 code files
  //    - Create GitHub repo
  //    - Show progress
}
```

### Step 5: What Happens Next (Depends on User Tier)

#### Free User Path
```
User clicks "Build Full App"
    ↓
Sees "Upgrade to Pro" modal
    ↓
Clicks "Upgrade"
    ↓
Lemonsqueezy payment flow
    ↓ (Payment successful)
Webhook: order_completed
    ↓
Backend updates: UPDATE users SET is_pro = true WHERE id = ?
    ↓
Redirect to /payment/success
    ↓ (After 5 seconds)
Redirect to /dashboard
    ↓
User can now build

END STATE: User has Pro, blueprint saved in sessionStorage, 
but needs to click "Build" again to trigger code generation
```

#### Pro User Path
```
User clicks "Build Full App"
    ↓
Immediately redirected to /build-full-app
    ↓
Page loads blueprint from sessionStorage
    ↓
Initiates code generation:
  Step 1: Parse blueprint structure (5 sec)
  Step 2: Generate code files (20 sec)
  Step 3: Create GitHub repo (10 sec)
    ↓
Shows progress page with:
  ✅ Parsing complete
  ✅ Generating files
  ✅ Creating GitHub repo
    ↓
Final page shows:
  - Generated GitHub repo link
  - Download code as ZIP
  - Next steps to deploy

END STATE: User has complete app code ready to build on
```

---

## Current Data Flow Diagram

```
┌──────────────────┐
│   User (Free)    │
└────────┬─────────┘
         │ Generate blueprint
         ↓
    ┌────────────┐
    │ Mistral AI │ (OpenAI-like)
    └────────┬───┘
             │ Blueprint text
             ↓
    ┌──────────────────────┐
    │ BlueprintOutput.tsx  │
    │ (Display & Actions)  │
    └────────┬─────────────┘
             │
        ┌────┴────────────────────┐
        │                         │
    (Copy)                   (Build Full App)
        │                         │
        ↓                         ↓
   Clipboard            ┌─────────────────┐
                        │ Check isPro     │
                        └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                   NO                       YES
                    │                         │
                    ↓                         ↓
            ┌───────────────┐        ┌──────────────────┐
            │ ProUpgradeModal       │ /build-full-app  │
            │ (Show pricing)        │ (Code generation)│
            └────────┬──────┘        └──────────────────┘
                     │
           (Payment flow)
                     │
                     ↓
            ┌──────────────────┐
            │ /payment/success │
            │ (5 sec redirect) │
            └────────┬─────────┘
                     │
                     ↓
            ┌──────────────────┐
            │   /dashboard     │
            │   (NEW HUB!)     │
            └──────────────────┘
```

---

## Current Database Tables & Operations

### blueprints table
```sql
CREATE TABLE blueprints (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  vibe TEXT,              -- User's project idea
  blueprint TEXT,         -- Generated markdown
  created_at TIMESTAMP
);

Operations:
- INSERT: When blueprint generated
- SELECT: When user loads history
- DELETE: When user deletes blueprint
```

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR,
  name VARCHAR,
  is_pro BOOLEAN,         -- ← Key field for checking access
  created_at TIMESTAMP,
  subscription_active BOOLEAN
);

Query:
SELECT is_pro FROM users WHERE id = ? 
```

### Subscription Check
```
User clicks "Build Full App"
    ↓
Call useProStatus() hook
    ↓
SELECT is_pro FROM users WHERE id = ?
    ↓
    ├─ true (Pro)  → Redirect to /build-full-app
    └─ false (Free) → Show upgrade modal
```

---

## Current Rate Limiting

### How It Works
```
User wants to generate blueprint
    ↓
Backend checks:
  SELECT COUNT(*) FROM blueprints 
  WHERE user_id = ? 
  AND created_at > NOW() - INTERVAL '1 day'
    ↓
If count >= 3 AND user.is_pro = false
    ├─ Return 429 Too Many Requests
    └─ Show "Upgrade to Pro" modal
Else
    └─ Proceed with generation
```

### Free Tier Limits
- 3 blueprints per day
- 5 saved blueprints
- 3 AI chats per day
- Limited export options

### Pro Tier Limits
- Unlimited blueprints
- Unlimited saves
- Unlimited chats
- All export options
- Full app generation

---

## Current State Management

### What's in memory (React state)
```typescript
// HomeClient.tsx
const [projectIdea, setProjectIdea] = useState('');    // "Build a REST API..."
const [blueprint, setBlueprint] = useState('');        // Full markdown text
const [loading, setLoading] = useState(false);         // Is generating?
const [error, setError] = useState('');                // Any error message?
```

### What's in browser storage (sessionStorage)
```javascript
// After user generates blueprint
sessionStorage.setItem('blueprintToBuild', JSON.stringify({
  projectIdea: "Build a REST API...",
  blueprint: "# Project Architecture\n\n...",
  timestamp: 1704000000000
}));

// This persists between page navigation
// Gets cleared after /build-full-app uses it
```

### What's in cloud (Supabase)
```
users.is_pro        ← Current subscription status
blueprints.*        ← All generated blueprints
blueprints.user_id  ← Links to user
blueprints.created_at ← For rate limiting
```

---

## Current Components & Their Jobs

| Component | Purpose | Location |
|-----------|---------|----------|
| **HomeClient** | Main generator UI, handles form | `app/home/HomeClient.tsx` |
| **BlueprintOutput** | Display & actions (copy, save, export) | `components/BlueprintOutput.tsx` |
| **BuildFullAppButton** | Pro check & redirect | `components/BuildFullAppButton.tsx` |
| **ProUpgradeModal** | Show pricing & payment | `components/ProUpgradeModal.tsx` |
| **ChatBubble** | AI chat assistant | `components/ChatBubble.tsx` |
| **ProUpgradeButton** | Generic "Upgrade" CTA | `components/ProUpgradeButton.tsx` |

---

## Current API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/mentor` | POST | Generate blueprint using Mistral |
| `/api/auth/*` | Various | NextAuth authentication |
| `/api/lemonsqueezy/checkout` | POST | Create checkout session |
| `/api/lemonsqueezy/webhook` | POST | Handle payment webhook |

---

## Summary: Current Experience

**For Free Users:**
```
30 seconds per day:
1. Write project idea
2. Generate blueprint
3. View & copy
4. Download markdown
5. See "Upgrade" button
6. Leave ❌ (no incentive to stay)
```

**For Pro Users:**
```
Every few days:
1. Write project idea
2. Generate blueprint
3. Export as PDF/GitHub
4. Generate full app code
5. Deploy app
6. Repeat ✓ (recurring value)
```

---

## Limitations of Current System

1. **No Project Tracking** - Blueprint is just text, no ongoing management
2. **No Team Features** - Single user only, no collaboration
3. **No Community** - Can't share or learn from others
4. **No Code Reuse** - Each blueprint is separate
5. **Limited Stickiness** - Users generate once and leave
6. **Low Recurring Value** - One-time transactions only
7. **No Network Effects** - Isolated users, no connections

---

## What the Hub Transformation Fixes

```
CURRENT                          →    FUTURE (HUB)
─────────────────────────────────    ─────────────────────────────
Blueprint only                   →    Blueprint + Project Workspace
Single-use                       →    Long-term project tracking
Individual only                  →    Teams & collaboration
No sharing                       →    Community & showcase
Limited engagment                →    Sticky, recurring platform
Low LTV                          →    High LTV with network effects
```

---

## Next Steps to Understand Transformation

After reading this, you should:

1. ✅ Understand current flow: **CURRENT_USER_FLOW.md** (detailed walkthrough)
2. ✅ See the evolution: **CURRENT_vs_FUTURE.md** (comparison & benefits)
3. ✅ Plan implementation: **PHASE_1_IMPLEMENTATION.md** (start building)

---

**Key Takeaway:**

Currently, VibeCode generates a one-time blueprint. After the Hub transformation, it becomes a complete project management platform where users generate blueprints, create projects, invite teams, collaborate, and ship apps together.

From **"Generate blueprint once"** to **"Build entire projects in a hub."**
