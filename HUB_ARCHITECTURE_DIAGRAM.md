# Vibe Coding Project Hub - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    VIBE CODING PROJECT HUB - FULL STACK                         │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │  USER BROWSER    │
                              └────────┬─────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
   ┌─────────────┐          ┌──────────────────┐          ┌──────────────────┐
   │   Landing   │          │    Dashboard     │          │    Community     │
   │   Page      │          │    Hub (Private) │          │    Portal        │
   └─────────────┘          └──────────────────┘          └──────────────────┘


┌──────────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND APPLICATION LAYER                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  Routes:                                                                           │
│  ├── /                              Home & Landing                                │
│  ├── /dashboard                     Main hub                                      │
│  │   ├── /projects                  Project management                            │
│  │   ├── /generator                 Enhanced blueprint generator                  │
│  │   ├── /team                       Team collaboration                           │
│  │   ├── /snippets                  Code snippets library                         │
│  │   ├── /analytics                 Usage dashboard                               │
│  │   ├── /marketplace               Templates & components                        │
│  │   └── /settings                  User preferences                              │
│  ├── /community                     Community features                            │
│  │   ├── /showcase                  Project gallery                               │
│  │   ├── /templates                 Community templates                           │
│  │   └── /forum                     Discussions & Q&A                             │
│  └── /project/:id                   Detailed project view                         │
│                                                                                    │
│  Components:                                                                       │
│  ├── HubLayout (Main Container)                                                   │
│  ├── Sidebar (Navigation)                                                         │
│  ├── ProjectWorkspace                                                             │
│  ├── BlueprintGenerator (Enhanced)                                                │
│  ├── SnippetEditor & Library                                                      │
│  ├── TeamCollaborationPanel                                                       │
│  ├── CommunityFeed                                                                │
│  └── AnalyticsDashboard                                                           │
│                                                                                    │
└──────────────────────┬───────────────────────────────────────────────────────────┘
                       │
                       │ HTTPS / REST API + WebSocket
                       │
┌──────────────────────┴───────────────────────────────────────────────────────────┐
│                         BACKEND API LAYER (Node.js/Next.js)                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  Core API Routes:                                                                  │
│                                                                                    │
│  /api/projects/              CRUD for projects                                    │
│  ├── GET    - List projects                                                       │
│  ├── POST   - Create project                                                      │
│  └── [id]   - Get/Update/Delete individual project                                │
│                                                                                    │
│  /api/blueprints/            Enhanced blueprint management                        │
│  ├── POST   - Generate blueprint (improved)                                       │
│  ├── GET    - List user blueprints                                                │
│  └── [id]   - Save/Share blueprint                                                │
│                                                                                    │
│  /api/snippets/              Code snippet library                                 │
│  ├── GET    - Search snippets                                                     │
│  ├── POST   - Create snippet                                                      │
│  └── [id]   - Get/Update/Delete snippet                                           │
│                                                                                    │
│  /api/templates/             Community template marketplace                       │
│  ├── GET    - Browse templates                                                    │
│  ├── POST   - Submit template                                                     │
│  └── [id]   - Rate/Download template                                              │
│                                                                                    │
│  /api/team/                  Team collaboration                                   │
│  ├── POST   - Invite member                                                       │
│  ├── GET    - List team members                                                   │
│  └── [id]   - Manage roles                                                        │
│                                                                                    │
│  /api/community/             Community features                                   │
│  ├── /posts     - Forum discussions                                               │
│  ├── /showcase  - Project gallery                                                 │
│  └── /leaderboard - Top contributors                                              │
│                                                                                    │
│  /api/analytics/             User analytics                                       │
│  ├── GET    - Dashboard metrics                                                   │
│  └── /export - Data export                                                        │
│                                                                                    │
│  /api/integrations/          External service integrations                        │
│  ├── /github   - GitHub sync                                                      │
│  ├── /slack    - Slack bot                                                        │
│  └── /discord  - Discord notifications                                            │
│                                                                                    │
│  Middleware & Auth:                                                                │
│  ├── NextAuth (Authentication)                                                    │
│  ├── RateLimiter (Per-tier limits)                                                │
│  ├── PermissionChecker (Role-based access)                                        │
│  ├── ValidationMiddleware                                                         │
│  └── ErrorHandler                                                                 │
│                                                                                    │
│  AI Integration:                                                                   │
│  ├── MistralAI (Blueprint generation)                                             │
│  ├── CodeParser (Structure analysis)                                              │
│  ├── TemplateEngine (Code generation)                                             │
│  └── EmbeddingsService (Semantic search)                                          │
│                                                                                    │
└──────────────────────┬───────────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────────┐   ┌──────────────┐
   │ Supabase│   │   Redis     │   │   External   │
   │         │   │  (Cache &   │   │  Services    │
   │Database │   │  Real-time) │   │              │
   └─────────┘   └─────────────┘   └──────────────┘


┌──────────────────────────────────────────────────────────────────────────────────┐
│                       DATA PERSISTENCE LAYER                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  Supabase (PostgreSQL):                                                            │
│  ├── users                   User accounts & profiles                             │
│  ├── projects                Project metadata & tracking                          │
│  ├── project_phases          Milestones & phases                                  │
│  ├── blueprints              Generated blueprints                                 │
│  ├── snippets                Code snippets                                        │
│  ├── templates               Community templates                                  │
│  ├── community_posts         Forum discussions                                    │
│  ├── community_replies       Comments & threads                                   │
│  ├── team_collaborations     Team member management                               │
│  ├── activity_logs           Audit trail                                          │
│  ├── payments                Transaction records                                  │
│  └── notifications           User notifications                                   │
│                                                                                    │
│  Redis:                                                                            │
│  ├── Session cache           User sessions                                        │
│  ├── Rate limit counters     API rate limits per tier                             │
│  ├── Real-time collaboration Cursor positions, live edits                         │
│  ├── Presence data           Who's online                                         │
│  └── Temporary data          File uploads, draft saves                            │
│                                                                                    │
│  Cloud Storage (S3/Supabase Storage):                                              │
│  ├── Project assets          Images, files                                        │
│  ├── Code exports            Generated code files                                 │
│  ├── PDF exports             Blueprint documents                                  │
│  └── User avatars            Profile pictures                                     │
│                                                                                    │
└──────────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  ┌────────────┐      ┌──────────────┐     ┌──────────────┐     ┌──────────────┐ │
│  │   GitHub   │      │   Mistral    │     │  Lemonsqueezy│     │    Slack     │ │
│  │            │      │      AI      │     │  (Payments)  │     │              │ │
│  │ - Sync     │      │              │     │              │     │ - Notifications
│  │ - Issues   │      │ - Generate   │     │ - Webhooks   │     │ - Bot        │ │
│  │ - Repos    │      │ - Suggest    │     │ - Checkout   │     │ - Updates    │ │
│  │ - CI/CD    │      │ - Chat       │     │ - Subscriptions     │              │ │
│  └────────────┘      └──────────────┘     └──────────────┘     └──────────────┘ │
│                                                                                    │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                      │
│  │   Discord    │     │   Resend     │     │  Sentry      │                      │
│  │              │     │   (Email)    │     │  (Monitoring)│                      │
│  │ - Bot        │     │              │     │              │                      │
│  │ - Webhooks   │     │ - Auth       │     │ - Errors     │                      │
│  │ - Announcements     │ - Notifications   │ - Analytics  │                      │
│  └──────────────┘     └──────────────┘     └──────────────┘                      │
│                                                                                    │
└──────────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME FEATURES (WebSocket)                               │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  Live Collaboration:                                                               │
│  ├── Blueprint co-editing    Multiple users editing same blueprint                │
│  ├── Cursor positions        See where others are typing                          │
│  ├── Presence indicators     Who's in the project                                 │
│  ├── Comments in real-time   Instant feedback                                     │
│  └── Live notifications      Instant updates                                      │
│                                                                                    │
│  Real-time Sync:                                                                   │
│  ├── Project status updates  Auto-refresh on changes                              │
│  ├── Team member actions     See what teammates are doing                         │
│  ├── Code snippet shares     Instant library updates                              │
│  └── Community activity      Live feed updates                                    │
│                                                                                    │
└──────────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT & INFRASTRUCTURE                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  Hosting:                                                                          │
│  ├── Vercel (Next.js Edge Functions)                                              │
│  ├── Supabase (PostgreSQL + Auth)                                                 │
│  ├── Redis Cloud (Real-time)                                                      │
│  └── AWS S3 / Supabase Storage (Files)                                            │
│                                                                                    │
│  CI/CD:                                                                            │
│  ├── GitHub Actions (Tests, Linting)                                              │
│  ├── Vercel Deployment (Auto-deploy on push)                                      │
│  ├── Database Migrations (Automated)                                              │
│  └── Monitoring & Alerts (Sentry)                                                 │
│                                                                                    │
│  Security:                                                                         │
│  ├── NextAuth.js (Authentication)                                                 │
│  ├── Row Level Security (RLS in Supabase)                                         │
│  ├── API Key management (Environment variables)                                   │
│  ├── Rate limiting (By subscription tier)                                         │
│  ├── Content Security Policy (CSP)                                                │
│  └── HTTPS/TLS (Encryption in transit)                                            │
│                                                                                    │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Blueprint Generation to Project Creation Flow

```
User Input
    │
    ├─→ Metadata (name, type, goals)
    ├─→ Tech stack selection
    ├─→ Architecture preferences
    └─→ Team configuration
    
         │
         ▼
    ┌────────────────────┐
    │ MistralAI Service  │
    │ - Enhanced prompts │
    │ - Smart defaults   │
    │ - Multi-step input │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Generated Blueprint    │
    │ - Architecture detail  │
    │ - Tech recommendations│
    │ - Phase breakdown      │
    │ - Deliverables        │
    └────────┬───────────────┘
             │
             ├─→ Save Blueprint
             │   (Database)
             │
             ├─→ Create Project
             │   (Metadata)
             │
             ├─→ Auto-generate Phases
             │   (Phase 1, 2, 3...)
             │
             └─→ Prepare for GitHub
                 (Issue templates)
```

### 2. Team Collaboration Flow

```
Project Owner Invites Member
    │
    ├─→ Send Email Invitation
    ├─→ Create Team Record
    └─→ Set Role & Permissions
    
         │
         ▼
    Team Member Accepts
    
         │
         ▼
    ┌─────────────────────────┐
    │ Real-time Permissions   │
    │ - Can view blueprint    │
    │ - Can edit/comment      │
    │ - Can update phases     │
    │ - Can invite others     │
    └────────┬────────────────┘
             │
             ├─→ Activity log
             ├─→ Presence tracking
             ├─→ Collaboration feed
             └─→ Notifications
```

### 3. Community Snippet Sharing Flow

```
User Creates Snippet
    │
    ├─→ Select code
    ├─→ Add metadata
    │   (language, tags, description)
    └─→ Choose visibility
        (public/private)
    
         │
         ▼
    Save to Database
    
         │
         ├─→ If Public: Add to Library
         │   ├─→ Indexing (search)
         │   ├─→ Trending calculation
         │   └─→ Notifications to followers
         │
         └─→ Share with Team
             ├─→ Direct links
             ├─→ Chat integration
             └─→ Notifications
```

### 4. Code Generation Flow (Pro Feature)

```
User Clicks "Generate Code"
    │
    ├─→ Check subscription (Pro?)
    ├─→ Check rate limits
    └─→ Select framework & options
    
         │
         ▼
    ┌──────────────────────────┐
    │ Code Generation Engine   │
    │ - Template selection     │
    │ - Parameter injection    │
    │ - Mistral enhancement    │
    │ - Code formatting        │
    └────────┬─────────────────┘
             │
             ▼
    Generated Code Files
    │
    ├─→ Preview in editor
    ├─→ Download as ZIP
    ├─→ Push to GitHub repo
    └─→ Deploy option
```

---

## Component Interaction Matrix

```
┌──────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Component    │ Projects │ Snippets │ Templates│ Team     │ Community│
├──────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Projects     │    ✓     │    ✓     │    ✓     │    ✓     │    ✓     │
│ Snippets     │    ✓     │    ✓     │    -     │    ✓     │    ✓     │
│ Templates    │    ✓     │    ✓     │    ✓     │    -     │    ✓     │
│ Team         │    ✓     │    ✓     │    -     │    ✓     │    -     │
│ Community    │    ✓     │    ✓     │    ✓     │    -     │    ✓     │
│ Analytics    │    ✓     │    ✓     │    ✓     │    ✓     │    ✓     │
└──────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

Key:
✓ = Direct integration
- = No direct integration (access via other components)
```

---

## State Management Structure

```
App State:
├── Auth State
│   ├── user
│   ├── subscription
│   ├── permissions
│   └── session
│
├── Projects State
│   ├── currentProject
│   ├── projects list
│   ├── phases
│   └── tasks
│
├── Collaboration State
│   ├── teamMembers
│   ├── activeUsers
│   ├── cursors
│   └── comments
│
├── UI State
│   ├── sidebarOpen
│   ├── modalsOpen
│   ├── currentTab
│   └── notifications
│
└── Cache State
    ├── blueprints
    ├── snippets
    ├── templates
    └── community posts
```

---

## Scalability Considerations

```
Database Optimization:
├── Indexing on frequently queried fields
├── Partitioning for large tables (activity logs)
├── Read replicas for analytics
└── Connection pooling (PgBouncer)

API Optimization:
├── Response pagination
├── GraphQL fragments (optional future)
├── Caching strategy (Redis)
├── CDN for static assets
└── API versioning

Real-time Optimization:
├── Connection pooling
├── Message compression
├── Room-based subscriptions
└── Graceful degradation

Search Optimization:
├── Elasticsearch (future)
├── Semantic search with embeddings
├── Auto-complete suggestions
└── Full-text search indexes
```

---

This architecture provides:
- **Scalability**: From 100 to 1M+ users
- **Reliability**: Redundancy, backups, monitoring
- **Performance**: Caching, CDN, optimization
- **Security**: Authentication, permissions, data protection
- **Extensibility**: Easy to add new features and integrations
