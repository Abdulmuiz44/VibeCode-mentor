'use client';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/build';

    const [googleLoading, setGoogleLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignIn = async () => {
        if (googleLoading || githubLoading) return;
        setError('');
        setGoogleLoading(true);

        try {
            await signIn('google', {
                callbackUrl,
            });
        } catch {
            setError('Failed to connect to Google. Please try again.');
            setGoogleLoading(false);
        }
    };

    const handleGitHubSignIn = async () => {
        if (googleLoading || githubLoading) return;
        setError('');
        setGithubLoading(true);

        try {
            await signIn('github', {
                callbackUrl,
            });
        } catch {
            setError('Failed to connect to GitHub. Please try again.');
            setGithubLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <div className="w-full max-w-md bg-black border border-white/10 rounded-2xl p-8 relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block mb-6 group">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <p className="text-lg uppercase tracking-[0.3em] font-bold text-white">VibeCode</p>
                        </div>
                    </Link>

                    <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
                    <p className="text-gray-500 text-sm">Sign in to start building your ideas</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {/* OAuth Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || githubLoading}
                        type="button"
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-black font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 active:scale-[0.98]"
                    >
                        {googleLoading ? (
                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
                    </button>

                    <button
                        onClick={handleGitHubSignIn}
                        disabled={googleLoading || githubLoading}
                        type="button"
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 active:scale-[0.98]"
                    >
                        {githubLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                        )}
                        <span>{githubLoading ? 'Connecting...' : 'Continue with GitHub'}</span>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-600">
                        By signing in, you agree to our{' '}
                        <Link href="/terms" className="text-gray-400 hover:text-white transition-colors underline">
                            Terms
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors underline">
                            Privacy Policy
                        </Link>
                    </p>
                </div>

                <div className="text-center mt-6 pt-6 border-t border-white/5">
                    <Link href="/" className="text-sm text-gray-600 hover:text-white transition-colors inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to home
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <AuthContent />
        </Suspense>
    );
}
