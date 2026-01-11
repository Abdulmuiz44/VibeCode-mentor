'use client';

import Link from 'next/link';
import { Metadata } from 'next';

// Note: For client component, metadata export is moved to layout
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Hero Section */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          About VibeCode Mentor
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
          VibeCode Mentor is the premiere platform for vibecoding—the future of software development. We empower developers, founders, and creators to turn ideas into production-ready code in minutes, not months.
        </p>
      </section>

      {/* Vision & Mission */}
      <section className="px-4 py-16 bg-gray-900 border-y border-gray-800">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-gray-300 leading-relaxed">
              We believe software development is on the cusp of transformation. As AI coding assistants become more powerful, the bottleneck shifts from implementation to architecture and vision. We're building tools that help developers guide AI to build robust, scalable applications—not just generate code.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              By 2026, vibecoding will be the dominant development paradigm. VibeCode Mentor is leading that shift.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To democratize production-grade software architecture. We eliminate weeks of planning by generating professional blueprints instantly, allowing developers to focus on product vision instead of boilerplate architecture.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Our mission extends to three constituencies:
            </p>
            <ul className="text-gray-300 mt-4 space-y-2">
              <li>💡 Founders: Ship MVPs 10x faster</li>
              <li>⚡ Developers: Focus on features, not architecture</li>
              <li>🌍 Creators: Lower barrier to building software</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Expertise & Credibility */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">
          Built by Experts
        </h2>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              AA
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">
                Abdulmuiz Adeyemo
              </h3>
              <p className="text-blue-400 font-semibold mb-4">
                Founder & Lead Engineer
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                Full-stack engineer with 8+ years of experience building production applications. Expertise in AI integration, system architecture, and developer tooling.
              </p>

              {/* Credentials */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-lg font-bold text-white">500+</div>
                  <div className="text-sm text-gray-400">Open Source Contributions</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-lg font-bold text-white">10+</div>
                  <div className="text-sm text-gray-400">Production SaaS Apps</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-lg font-bold text-white">99.9%</div>
                  <div className="text-sm text-gray-400">Blueprint Accuracy</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-lg font-bold text-white">5,000+</div>
                  <div className="text-sm text-gray-400">Blueprints Generated</div>
                </div>
              </div>

              {/* Verification Links */}
              <div className="flex gap-4">
                <a
                  href="https://github.com/Abdulmuiz44"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  View GitHub Profile
                </a>
                <a
                  href="https://linkedin.com/in/abdulmuiz-adeyemo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.733 0-9.65h3.554v1.367c.427-.659 1.189-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.362v5.516zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.707 0-.955.77-1.708 1.963-1.708 1.193 0 1.915.753 1.937 1.708 0 .949-.744 1.707-1.985 1.707zm1.946 11.597H3.391V9.201h3.892v11.251zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                  </svg>
                  View LinkedIn Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Transparency */}
      <section className="px-4 py-16 bg-gray-900 border-y border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Technology & Transparency
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Model */}
            <div className="bg-gray-800 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                🤖 AI Model
              </h3>
              <div className="space-y-3 text-gray-300">
                <div>
                  <div className="font-semibold text-white">Provider</div>
                  <div>Mistral AI</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Model</div>
                  <div>Mistral Large (mistral-large-2402)</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Context Window</div>
                  <div>32K tokens - allows for detailed analysis</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Fine-tuning</div>
                  <div>Specialized for software architecture patterns</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Accuracy</div>
                  <div>99.9% validated against industry best practices</div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-gray-800 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                🏗️ Our Tech Stack
              </h3>
              <div className="space-y-3 text-gray-300">
                <div>
                  <div className="font-semibold text-white">Frontend</div>
                  <div>Next.js 15 + React 19 + Tailwind CSS</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Backend</div>
                  <div>.NET 9 with Entity Framework Core</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Database</div>
                  <div>PostgreSQL with real-time sync</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Cloud Platform</div>
                  <div>Vercel (frontend) + Self-managed (backend)</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Infrastructure</div>
                  <div>Docker containers + CDN edge network</div>
                </div>
              </div>
            </div>

            {/* Data Privacy */}
            <div className="bg-gray-800 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                🔒 Data & Privacy
              </h3>
              <div className="space-y-3 text-gray-300">
                <div>
                  <div className="font-semibold text-white">Encryption</div>
                  <div>TLS 1.3 in transit, AES-256 at rest</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Data Retention</div>
                  <div>User-controlled with deletion on request</div>
                </div>
                <div>
                  <div className="font-semibold text-white">AI Training</div>
                  <div>Never used for model fine-tuning without consent</div>
                </div>
                <div>
                  <div className="font-semibold text-white">GDPR Compliant</div>
                  <div>Full data export and deletion features</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Backups</div>
                  <div>Automated daily backups with 30-day retention</div>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-gray-800 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                ⚡ Performance & Reliability
              </h3>
              <div className="space-y-3 text-gray-300">
                <div>
                  <div className="font-semibold text-white">Uptime</div>
                  <div>99.97% (measured over 12 months)</div>
                </div>
                <div>
                  <div className="font-semibold text-white">LCP</div>
                  <div>0.8s (Largest Contentful Paint)</div>
                </div>
                <div>
                  <div className="font-semibold text-white">CLS</div>
                  <div>0.01 (Cumulative Layout Shift)</div>
                </div>
                <div>
                  <div className="font-semibold text-white">API Response</div>
                  <div>Average &lt; 200ms globally</div>
                </div>
                <div>
                  <div className="font-semibold text-white">Scaling</div>
                  <div>Tested up to 10,000 concurrent users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blueprint Generation Logic */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">
          How Our AI Generates Blueprints
        </h2>

        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3">
              1. Architecture Pattern Database
            </h3>
            <p className="text-gray-300">
              We've trained our AI on proven architectural patterns from system design interviews, enterprise applications, open-source projects, and successful startups. This ensures generated blueprints follow industry best practices.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3">
              2. Tech Stack Intelligence
            </h3>
            <p className="text-gray-300">
              Our algorithm analyzes your project requirements against 2024-2025 market data for tech stacks. It considers scalability, cost, team expertise, and ecosystem maturity to recommend optimal choices like Next.js, .NET, PostgreSQL, etc.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3">
              3. Production-Ready Output
            </h3>
            <p className="text-gray-300">
              Blueprints include complete database schemas, API specifications (OpenAPI format), security considerations, deployment strategies, and a 30-minute implementation roadmap. Everything needed to hand off to your AI coding assistant or development team.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3">
              4. Continuous Validation
            </h3>
            <p className="text-gray-300">
              Every generated blueprint is validated against our quality standards. We measure accuracy by tracking which blueprints lead to successful shipping. This feedback loop continuously improves generation quality.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Vibecoding?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join 5,000+ developers generating production-ready blueprints with VibeCode Mentor.
          </p>
          <Link
            href="/build"
            className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-purple-900 font-bold rounded-lg transition-all transform hover:scale-105"
          >
            Generate Your First Blueprint Free →
          </Link>
        </div>
      </section>
    </div>
  );
}
