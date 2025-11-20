 import 'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UsageCounter from '@/components/UsageCounter';
import ProBadge from '@/components/ProBadge';
import AuthButton from '@/components/AuthButton';
import { useProUpgradeModal } from '@/components/ProUpgradeModal';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Templates', href: '/templates' },
  { label: 'Prompts', href: '/prompts' },
  { label: 'History', href: '/history' },
];

export default function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { openUpgradeModal } = useProUpgradeModal();

  const isAuthRoute = pathname?.startsWith('/auth');
  const isLandingRoute = pathname === '/landing';
  const shouldHideHeader = status !== 'authenticated' || !session?.user || isLandingRoute || isAuthRoute;

  if (shouldHideHeader) return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-[#050505]/80 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-full border border-gray-700 p-2 text-gray-300 transition hover:border-pink-500 hover:text-white"
            onClick={() => setIsMenuOpen(true)}
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
    </header>

    {isMenuOpen && (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="absolute inset-0 bg-black/60"
          aria-hidden="true"
          onClick={() => setIsMenuOpen(false)}
        />
        <aside className="relative z-10 w-72 border border-white/10 bg-[#050505] px-6 py-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Navigation</h3>
            <button
              type="button"
              aria-label="Close menu"
              className="text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block rounded-xl px-3 py-2 transition hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <ProBadge />
          <button
            type="button"
            onClick={() => {
              openUpgradeModal({ source: 'Navigation Menu' });
              setIsMenuOpen(false);
            }}
            className="mt-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105"
          >
            Upgrade to Pro
          </button>
        </aside>
      </div>
    )}
  </>
  );
}
