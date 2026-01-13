# VibeCode Mentor Architecture
## "Turn Your Ideas Into Production Ready Apps"

> **Version**: 2.0  
> **Last Updated**: January 2026

---

## Vision

VibeCode Mentor transforms from a blueprint generator into an **AI-powered app factory** that takes a user from idea → working app → deployed product in minutes.

---

## User Journey

```
💡 Describe Idea → 📋 AI Blueprint → ⚡ Review → 🔨 Build → 👁️ Preview → 🚀 Deploy
```

| Stage | Time | What Happens |
|-------|------|--------------|
| Describe | 30s | User enters idea in natural language |
| Blueprint | 60s | AI generates tech stack + architecture |
| Build | 120s | Real code execution in cloud sandbox |
| Preview | 30s | Live preview in iframe |
| Deploy | 60s | One-click to Vercel |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 15)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Home   │  │ Projects │  │  Builder │  │  Preview │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                       AI LAYER                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ Orchestrator│ │ Architect │ │   Coder    │ │ Fix Agent│ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│                        │                                    │
│                   Gemini Pro API                            │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    EXECUTION LAYER                           │
│  ┌────────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Cloud Sandbox  │  │ GitHub API │  │ Vercel API │        │
│  │ (E2B/StackBlitz)│  │            │  │            │        │
│  └────────────────┘  └────────────┘  └────────────┘        │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      DATA LAYER                              │
│           Supabase (PostgreSQL) + Vercel KV                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent System

| Agent | Purpose | Input | Output |
|-------|---------|-------|--------|
| **Orchestrator** | Coordinates build flow | User request | Build result |
| **Architect** | Generates blueprint | Idea description | Blueprint JSON |
| **Coder** | Generates code files | Blueprint | GeneratedFile[] |
| **Executor** | Runs in sandbox | Commands | Execution logs |
| **Fix Agent** | Repairs errors | Error logs | Fixed code |

---

## Sandbox Providers

| Provider | Use Case | Cost |
|----------|----------|------|
| **E2B** (Primary) | Cloud execution, Vercel-compatible | ~$0.05/min |
| **StackBlitz** (Fallback) | Browser-based, free tier | Free |
| **Docker** (Local) | Development only | N/A |

---

## Key Files

```
lib/
├── sandbox/
│   ├── index.ts          # SandboxManager abstraction
│   ├── e2b-client.ts     # E2B implementation
│   └── types.ts          # Shared types
├── agents/
│   ├── orchestrator.ts   # Coordinates all agents
│   ├── architect.ts      # Blueprint generation
│   ├── coder.ts          # LLM code generation
│   ├── execution.ts      # Sandbox execution
│   └── fix-agent.ts      # Error repair
└── deployment/
    └── vercel.ts         # Vercel deploy API

components/
├── LivePreview.tsx       # Iframe preview
└── BuildProgress.tsx     # Real-time logs
```

---

## Database Schema

```sql
-- Sandbox tracking
sandboxes (id, project_id, provider, sandbox_id, preview_url, status, expires_at)

-- Build logs
build_logs (id, project_id, step, level, message, timestamp)

-- Deployments
deployments (id, project_id, provider, url, status, deployed_at)
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/vibecode/sandbox/create` | POST | Create sandbox |
| `/api/vibecode/sandbox/[id]/execute` | POST | Run command |
| `/api/vibecode/sandbox/[id]/preview` | GET | Get preview URL |
| `/api/vibecode/deploy/vercel` | POST | Deploy to Vercel |

---

## Implementation Phases

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Foundation | Week 1-2 | Real code execution in E2B |
| 2. Live Preview | Week 2-3 | Iframe preview of running app |
| 3. Iterative Build | Week 3-4 | Chat-based modifications |
| 4. One-Click Deploy | Week 4-5 | Vercel deployment |
| 5. Polish | Week 5-6 | Error recovery, scaling |

---

## Rate Limits

| Feature | Free | Pro |
|---------|------|-----|
| Blueprints/day | 10 | Unlimited |
| Builds/day | 3 | Unlimited |
| Sandbox minutes | 15 | 120 |
| Deployments | 1 | Unlimited |
