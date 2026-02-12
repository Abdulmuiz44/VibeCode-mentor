import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[128px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-pink-900/5 rounded-full blur-[96px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative z-10 transition-all duration-300 hover:shadow-3xl hover:border-white/15">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105 group">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-lg uppercase tracking-[0.3em] font-bold text-white group-hover:text-purple-400 transition-colors">VibeCode</p>
            </div>
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">{subtitle}</p>
        </div>

        {children}

        <div className="text-center mt-8 pt-6 border-t border-white/5">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition-all duration-200 hover:underline inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 right-10 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
      <div className="absolute bottom-20 left-20 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
    </main>
  );
}