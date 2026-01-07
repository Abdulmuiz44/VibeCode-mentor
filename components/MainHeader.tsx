'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
            <header className="sticky top-0 z-40 border-b border-gray-300 dark:border-gray-900 bg-white dark:bg-black/80 backdrop-blur-xl text-black dark:text-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    {/* Left Side: Logo & Mobile Menu */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Open menu"
                            className="rounded-full border border-gray-400 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-300 transition hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white lg:hidden"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo.png"
                                alt="VibeCode Mentor Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                            <span className="text-lg font-semibold tracking-wide text-black dark:text-white hidden sm:block">VibeCode Mentor</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side: Usage, Upgrade, Auth */}
                    <div className="flex items-center gap-3">
                        <UsageCounter />
                        {session?.user && (
                            <Link
                                href="/profile"
                                className="hidden sm:block text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                Profile
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => openUpgradeModal({ source: 'Navigation' })}
                            className="hidden sm:block rounded-full bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 border border-black dark:border-white px-4 py-2 text-sm font-semibold text-black dark:text-white transition hover:scale-105"
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
                    <aside className="relative z-10 w-72 border border-white/10 bg-white dark:bg-[#050505] px-6 py-6 shadow-2xl backdrop-blur-xl flex flex-col gap-6 text-black dark:text-white">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-black dark:text-white">Navigation</h3>
                            <button
                                type="button"
                                aria-label="Close menu"
                                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="block rounded-xl px-3 py-2 transition hover:bg-gray-100 dark:hover:bg-white/10"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/profile"
                                className="block rounded-xl px-3 py-2 transition hover:bg-gray-100 dark:hover:bg-white/10 text-black dark:text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Profile & Usage
                            </Link>
                        </div>
                        <ProBadge />
                        <button
                            type="button"
                            onClick={() => {
                                openUpgradeModal({ source: 'Navigation Menu' });
                                setIsMenuOpen(false);
                            }}
                            className="mt-2 rounded-full bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 border border-black dark:border-white px-4 py-2 text-sm font-semibold text-black dark:text-white transition hover:scale-105"
                        >
                            Upgrade to Pro
                        </button>
                    </aside>
                </div>
            )}
        </>
    );
}
