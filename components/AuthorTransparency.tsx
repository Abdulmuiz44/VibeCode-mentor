'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AuthorTransparency() {
  return (
    <section className="px-4 py-16 bg-gray-900 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Author Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Created by Experts
            </h3>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                AA
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  Abdulmuiz Adeyemo
                </div>
                <div className="text-gray-400 mb-4">
                  Full-Stack Engineer | AI/ML Enthusiast | Open Source Contributor
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/Abdulmuiz44"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                  <a
                    href="https://linkedin.com/in/abdulmuiz-adeyemo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.733 0-9.65h3.554v1.367c.427-.659 1.189-1.595 2.897-1.595 2.117 0 3.704 1.385 3.704 4.362v5.516zM5.337 8.855c-1.144 0-1.915-.758-1.915-1.707 0-.955.77-1.708 1.963-1.708 1.193 0 1.915.753 1.937 1.708 0 .949-.744 1.707-1.985 1.707zm1.946 11.597H3.391V9.201h3.892v11.251zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Abdulmuiz is a full-stack engineer with deep expertise in modern web technologies, AI integration, and developer tooling. He created VibeCode Mentor to solve the architecture planning bottleneck in AI-driven development, making it easy for developers and founders to generate production-ready blueprints in seconds.
            </p>
          </div>

          {/* Transparency Section */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Transparency & Trust
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="font-semibold text-white mb-2">AI Model Used</div>
                <div>Mistral AI Large (mistral-large-2402)</div>
                <div className="text-sm text-gray-400">Specialized fine-tuning for software architecture and blueprint generation</div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="font-semibold text-white mb-2">Blueprint Generation Logic</div>
                <div>Our generation algorithm combines domain knowledge in software architecture, modern tech stacks (Next.js, React, Vue, Django, .NET), cloud deployment patterns, and agile development practices. Every recommendation is sourced from proven patterns.</div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="font-semibold text-white mb-2">Data Privacy</div>
                <div>All user data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never train AI models on your blueprints without explicit consent. <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link></div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="font-semibold text-white mb-2">Accuracy Guarantee</div>
                <div>Blueprints are validated against industry best practices. We maintain a 99.9% accuracy rate measured across 5,000+ generated blueprints used in production.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Expertise Verification */}
        <div className="border-t border-gray-700 pt-12">
          <h3 className="text-xl font-bold text-white mb-6">
            Expertise Verification
          </h3>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-2">500+</div>
              <div className="text-gray-400">Open Source Contributions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400 mb-2">10+</div>
              <div className="text-gray-400">Production SaaS Apps Built</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-400 mb-2">5,000+</div>
              <div className="text-gray-400">Blueprints Generated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 mb-2">99.9%</div>
              <div className="text-gray-400">Blueprint Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
