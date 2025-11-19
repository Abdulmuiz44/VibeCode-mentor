 'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UsageCounter from '@/components/UsageCounter';
import ProBadge from '@/components/ProBadge';
import AuthButton from '@/components/AuthButton';
import { useProUpgradeModal } from '@/components/ProUpgradeModal';

export default function MainHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { openUpgradeModal } = useProUpgradeModal();

  const isAuthRoute = pathname?.startsWith('/auth');
  const isLandingRoute = pathname === '/landing';
  const shouldHideHeader = !session?.user || isLandingRoute || isAuthRoute;

  if (shouldHideHeader) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-[#050505]/80 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-full border border-gray-700 p-2 text-gray-300 transition hover:border-pink-500 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="hidden lg:flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-wide text-white">VibeCode Mentor</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-wide text-white lg:hidden">VibeCode Mentor</span>
          <UsageCounter />
          <button
            type="button"
            onClick={() => openUpgradeModal({ source: 'Navigation' })}
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105"
          >
            Upgrade to Pro
          </button>
          <AuthButton />
        </div>
      </div>

      <nav className="hidden border-t border-gray-900 bg-[#050505]/70 lg:flex">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm text-gray-300">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <Link href="/templates" className="transition hover:text-white">
            Templates
          </Link>
          <Link href="/prompts" className="transition hover:text-white">
            Prompts
          </Link>
          <Link href="/history" className="transition hover:text-white">
            History
          </Link>
          <ProBadge />
        </div>
      </nav>
    </header>
  );
}
