# VibeCode Mentor

An AI-powered project blueprint generator that transforms your ideas into production-ready development plans using Mistral AI. **Built for developers, creators, solo founders, and builders.**

## ✨ Features

- 🤖 **AI-Powered Blueprints**: Generate comprehensive project blueprints with Mistral AI
- 📋 **19 Blueprint Templates**: Developer-focused templates for APIs, CLIs, extensions & more
- 🔧 **Dev Tools Category**: 9 specialized templates for developers
- ⌨️ **Keyboard Shortcuts**: Power user features for efficient workflow
- 📋 **Code Copy Buttons**: One-click copy for all code blocks
- 💬 **AI Chat Assistant**: Context-aware AI help with unlimited Pro access
- 🔐 **Google Authentication**: Secure sign-in with Firebase
- ☁️ **Cloud Sync**: Save and access blueprints from anywhere
- 💎 **Pro Subscription**: $5/month for unlimited features via Flutterwave
- 📊 **Usage Analytics**: Track your generations and popular vibes
- 📝 **Prompt Library**: Top 10 community vibes + custom prompts (Pro)
- 📤 **Export Options**: PDF, Markdown, GitHub repo creation (Pro features)
- 📱 **PWA Support**: Install as mobile app with offline capabilities
- 🎨 **Dark Mode UI**: Clean, minimal interface with Tailwind CSS
- 🚀 **Next.js 14**: Built with App Router and React Server Components
- ⚡ **Rate Limiting**: 10 gens/day, 3 chats/day for free users

## 🎯 Perfect For

- **Developers**: Building APIs, CLIs, extensions, and dev tools
- **Creators**: Launching side projects and products
- **Solo Founders**: Starting SaaS businesses
- **Builders**: Shipping projects quickly
- **Web Developers**: Creating modern web applications

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
- **AI**: Mistral AI API
- **Markdown**: react-markdown with remark-gfm
- **Deployment**: Vercel

## Project Structure

```
vibecode-mentor/
├── app/
│   ├── api/
│   │   └── mentor/
│   │       └── route.ts        # API route for Mistral AI integration
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   └── BlueprintOutput.tsx     # Markdown output component
├── .env.local.example          # Environment variables template
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

## Usage

1. Enter your project idea in the textarea
2. Click "Generate Blueprint"
3. Wait for AI to generate your blueprint
4. Click "Copy Blueprint" to copy to clipboard
5. Use the blueprint to build your project

## License

MIT

## Author

Built with 💙 by the VibeCode team

---

**You shipped TradiaAI—ship this.**
