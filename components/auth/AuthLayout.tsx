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
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 transition-transform hover:scale-105">
            <p className="text-sm uppercase tracking-[0.3em] font-bold text-white">VibeCode Mentor</p>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>

        {children}

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}