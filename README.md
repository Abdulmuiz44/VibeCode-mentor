# VibeCode Mentor

An AI-powered project blueprint generator that transforms your ideas into production-ready development plans using Mistral AI.

## ✨ New Features (Latest Update)

- 🏗️ **Structured Blueprints**: AI generates detailed JSON blueprints with scope, tech stack, system design, and tasks
- 🎨 **UI/UX Generator** (Pro): Auto-generate screens and Tailwind components
- 💻 **Code Generator** (Pro): Pair programmer mode for targeted code generation
- ⏱️ **Build Estimator**: Get realistic time estimates and cost projections
- 📦 **Project Scaffolding**: Download complete Next.js projects as ZIP files
- 🔗 **GitHub Auto-Creation** (Pro): One-click repository creation with initial structure
- 📊 **Blueprint Viewer**: Beautiful tabbed interface to explore project details

## Features

- 🤖 **AI-Powered Blueprints**: Generate comprehensive project blueprints with Mistral AI
- 📋 **Blueprint Templates**: 10+ pre-built templates for common project types
- 💬 **AI Chat Assistant**: Context-aware AI help with unlimited Pro access
- 🔐 **Google Authentication**: Secure sign-in with Firebase
- ☁️ **Cloud Sync**: Save and access blueprints from anywhere (Firestore)
- 💎 **Pro Subscription**: $5/month for unlimited features via Flutterwave
- 📊 **Usage Analytics**: Track your generations and popular vibes (Google Analytics)
- 📝 **Prompt Library**: Top 10 community vibes + custom prompts (Pro)
- 📤 **Export Options**: PDF, Markdown, GitHub repo creation (Pro features)
- 📱 **PWA Support**: Install as mobile app with offline capabilities
- 🎨 **Modern UI**: Clean interface with Tailwind CSS and responsive design
- 🚀 **Next.js 14**: Built with App Router and React Server Components
- ⚡ **Rate Limiting**: 10 gens/day, 3 chats/day for free users (Vercel KV)
- 🔍 **Error Tracking**: Production monitoring with Sentry
- 🛡️ **CI/CD**: Automated testing and deployment with GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Mistral AI API key (get one at [console.mistral.ai](https://console.mistral.ai/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibecode-mentor.git
cd vibecode-mentor
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Add your Mistral AI API key to `.env.local`:
```
MISTRAL_API_KEY=your_mistral_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/vibecode-mentor)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Add environment variable:
   - `MISTRAL_API_KEY`: Your Mistral AI API key
5. Click "Deploy"

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Mistral AI API (mistral-large-latest)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Cache/Rate Limiting**: Vercel KV (Redis)
- **Payment**: Flutterwave (primary), Stripe (future)
- **Email**: Resend
- **Analytics**: Google Analytics 4 + Vercel Analytics
- **Error Tracking**: Sentry
- **Markdown**: react-markdown with remark-gfm
- **PDF Generation**: jsPDF + html2canvas
- **Charts**: Recharts
- **GitHub API**: Octokit
- **Deployment**: Vercel

## Project Structure

```
vibecode-mentor/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # CI/CD pipeline
│   └── PULL_REQUEST_TEMPLATE.md
├── app/
│   ├── api/
│   │   ├── ai/                 # NEW: AI endpoints
│   │   │   ├── blueprint/      # Structured blueprint generation
│   │   │   ├── ui-generate/    # UI/UX generator (Pro)
│   │   │   ├── code-generate/  # Code generator (Pro)
│   │   │   └── estimate/       # Build time estimator
│   │   ├── scaffold/           # NEW: Project scaffolding
│   │   │   ├── generate/       # ZIP download
│   │   │   └── push-github/    # GitHub repo creation (Pro)
│   │   ├── mentor/             # Original blueprint API
│   │   ├── chat/               # AI chat assistant
│   │   ├── checkout/           # Payment processing
│   │   └── ...
│   ├── blueprint/              # NEW: Blueprint viewer
│   │   └── [id]/
│   │       └── page.tsx        # Dynamic blueprint page
│   ├── admin/                  # Admin dashboard
│   ├── history/                # Saved blueprints
│   ├── templates/              # Blueprint templates
│   ├── prompts/                # Prompt library
│   └── page.tsx                # Home page
├── components/
│   ├── feature/                # NEW: Feature components
│   │   ├── BlueprintHeader.tsx
│   │   ├── BlueprintSteps.tsx
│   │   └── UiGeneratorPreview.tsx
│   ├── BlueprintOutput.tsx
│   ├── ChatBubble.tsx
│   ├── AuthButton.tsx
│   └── ...
├── lib/
│   ├── ai-prompts.ts           # NEW: AI prompt templates
│   ├── scaffold.ts             # NEW: Project scaffold generator
│   ├── firebase.ts             # Firebase utilities
│   ├── kv.ts                   # Rate limiting
│   ├── email.ts                # Email service
│   └── analytics.ts            # Analytics tracking
├── docs/                       # NEW: Documentation
│   ├── features/
│   │   ├── api-endpoints.md
│   │   └── blueprint-execution.md
│   └── IMPLEMENTATION_STATUS.md
├── emails/                     # Email templates
├── types/                      # TypeScript types
└── ...
```

## API Endpoints

### Blueprint Generation
- `POST /api/mentor` - Original markdown blueprint
- `POST /api/ai/blueprint` - **NEW**: Structured JSON blueprint
- `POST /api/ai/estimate` - **NEW**: Build time & cost estimation

### Pro Features (Requires Subscription)
- `POST /api/ai/ui-generate` - **NEW**: Generate UI screens & components
- `POST /api/ai/code-generate` - **NEW**: Pair programmer code generation
- `POST /api/scaffold/push-github` - **NEW**: Auto-create GitHub repository

### Free Features
- `POST /api/scaffold/generate` - **NEW**: Download project scaffold ZIP
- `POST /api/chat` - AI chat assistant (rate limited)
- `GET /api/usage` - Usage statistics

See [docs/features/api-endpoints.md](docs/features/api-endpoints.md) for complete API documentation.

## Usage

### Basic Blueprint Generation
1. Enter your project idea
2. Click "Generate Blueprint"
3. View your structured blueprint with:
   - Project scope
   - Tech stack recommendations
   - System design
   - Folder structure
   - Development tasks with estimates
   - Best practices & hints

### Advanced Features (Pro)
1. **Generate UI**: Click "Generate UI" on any blueprint to create:
   - Screen layouts
   - Component library
   - Tailwind CSS code
   - Color palette
2. **Download Scaffold**: Get a complete Next.js project as ZIP
3. **Create GitHub Repo**: Auto-create repository with initial structure

### View Blueprint Details
- Navigate to `/blueprint/[id]` to see full blueprint
- Switch between tabs: Scope, Stack, Design, Structure, Tasks, Hints
- Copy generated code snippets
- Export as PDF or Markdown

## License

MIT

## Author

Built with 💙 by the VibeCode team

---

**You shipped TradiaAI—ship this.**
