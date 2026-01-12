import { Metadata } from 'next';
import Link from 'next/link';
import { getLandingStats } from '@/lib/stats';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About VibeCode Mentor | The Future of AI-Powered Software Development',
  description: 'VibeCode Mentor is the premiere platform for vibecoding. We empower developers to turn ideas into production-ready architecture using Mistral AI and Gemini.',
  openGraph: {
    title: 'About VibeCode Mentor - AI Blueprint Generator',
    description: 'Transforming software development with AI. From idea to production-ready blueprint in minutes.',
    type: 'website',
    url: 'https://vibecodementor.app/about',
    siteName: 'VibeCode Mentor',
  },
};

export default async function AboutPage() {
  const stats = await getLandingStats();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VibeCode Mentor',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'AI-powered blueprint generator for software developers.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: stats.rating.toString(),
      ratingCount: stats.usersCount.toString(),
    },
    author: {
      '@type': 'Person',
      name: 'Abdulmuiz Adeyemo',
      jobTitle: 'Founder & Lead Engineer',
      url: 'https://github.com/Abdulmuiz44',
    },
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">VibeCode Mentor</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            We are building the operating system for <strong>vibecoding</strong>—the paradigm shift where developers focus on vision and architecture while AI handles implementation.
          </p>
        </div>
      </section>

      {/* Real Stats Section - Mobile Optimized Grid */}
      <section className="px-4 py-12 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.blueprintsCount.toLocaleString()}
              </div>
              <div className="text-sm md:text-base text-gray-400 font-medium">Blueprints Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.usersCount.toLocaleString()}
              </div>
              <div className="text-sm md:text-base text-gray-400 font-medium">Active Builders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stats.rating}
              </div>
              <div className="text-sm md:text-base text-gray-400 font-medium">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                99.9%
              </div>
              <div className="text-sm md:text-base text-gray-400 font-medium">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - AEO Optimized */}
      <section className="px-4 py-20 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400">🚀</span>
              Our Mission
            </h2>
            <p className="text-gray-300 leading-relaxed">
              To democratize software architecture. We believe that by 2026, the primary bottleneck in software creation won't be writing code, but <strong>structuring it correctly</strong>. VibeCode Mentor provides the architectural guardrails that allow AI to generate robust, production-ready applications.
            </p>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400">🔮</span>
              The Vision
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We envision a world where a solo founder can build a scalable SaaS in a weekend. By combining <strong>Mistral AI's reasoning</strong> with our verified architectural patterns, we are turning that vision into reality today.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 py-20 bg-gray-900 border-y border-gray-800">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built by Experts</h2>
          <p className="text-gray-400">Engineered with precision and passion.</p>
        </div>

        <div className="max-w-2xl mx-auto bg-black border border-gray-800 rounded-2xl p-6 md:p-8 hover:border-gray-700 transition-colors">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl md:text-4xl shadow-xl shadow-purple-900/20">
              AA
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-bold text-white mb-1">Abdulmuiz Adeyemo</h3>
              <p className="text-blue-400 font-medium mb-4">Founder & Lead Engineer</p>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
                Full-stack engineer with extensive experience in AI systems and cloud architecture. Dedicated to building the tools that will power the next generation of software development.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <a
                  href="https://github.com/Abdulmuiz44"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                  aria-label="GitHub Profile"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
                <a
                  href="https://linkedin.com/in/abdulmuiz-adeyemo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                  aria-label="LinkedIn Profile"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AEO / FAQ Section */}
      <section className="px-4 py-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <details className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 open:border-purple-500/50">
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-800 transition-colors">
              <h3 className="font-semibold text-lg text-white">What exactly is Vibecoding?</h3>
              <span className="text-purple-400 group-open:rotate-180 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-gray-300 leading-relaxed border-t border-gray-800/50 pt-4">
              Vibecoding is a development methodology where the human provides the high-level creative direction and architectural decisions (the "vibe"), while AI tools execute the code implementation. It shifts the developer's role from writing syntax to curating and directing intelligent systems.
            </div>
          </details>

          <details className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 open:border-purple-500/50">
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-800 transition-colors">
              <h3 className="font-semibold text-lg text-white">Is VibeCode Mentor free?</h3>
              <span className="text-purple-400 group-open:rotate-180 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-gray-300 leading-relaxed border-t border-gray-800/50 pt-4">
              Yes! You can generate up to 10 blueprints per month completely free. We also offer a Pro plan for unlimited generations, GitHub repo creation, and PDF exports for power users.
            </div>
          </details>

          <details className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 open:border-purple-500/50">
            <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-800 transition-colors">
              <h3 className="font-semibold text-lg text-white">How accurate are the blueprints?</h3>
              <span className="text-purple-400 group-open:rotate-180 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-gray-300 leading-relaxed border-t border-gray-800/50 pt-4">
              Our blueprints are powered by Mistral AI, optimized specifically for system architecture. They are designed to be 99% production-ready, covering database schemas, API routes, and modern tech stacks like Next.js and Supabase.
            </div>
          </details>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-20 bg-black text-center border-t border-gray-900">
        <h2 className="text-3xl font-bold text-white mb-6">Build the future, today.</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/build" 
            className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all"
          >
            Start Building
          </Link>
          <Link 
            href="/templates" 
            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg border border-gray-700 hover:border-gray-500 transition-all"
          >
            Explore Templates
          </Link>
        </div>
      </section>
    </main>
  );
}