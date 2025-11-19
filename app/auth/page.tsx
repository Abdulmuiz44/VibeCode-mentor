'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export default function AuthPage() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get('returnTo') ?? '/';
  const callbackUrl = useMemo(() => returnTo || '/', [returnTo]);

  const [providers, setProviders] = useState<Record<string, any> | null>(null);
  const [email, setEmail] = useState('');
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  useEffect(() => {
    let isActive = true;

    fetch('/api/auth/providers')
      .then((res) => res.json())
      .then((data) => {
        if (isActive) setProviders(data);
      })
      .catch(() => {
        if (isActive) setProviders({});
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setMessage('Please enter a valid email');
      setEmailState('error');
      return;
    }

    setEmailState('sending');
    setMessage('Sending magic link...');

    const result = await signIn('email', {
      email,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setEmailState('error');
      setMessage(result.error ?? 'Unable to send link');
      return;
    }

    setEmailState('sent');
    setMessage('Magic link sent. Check your inbox!');
  };

  const hasEmailProvider = Boolean(providers?.email);
  const hasGoogleProvider = Boolean(providers?.google);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-gray-900/80 border border-gray-800 rounded-3xl p-10 shadow-2xl">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-400 mb-2">VibeCode Mentor</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">Create your account</h1>
            <p className="text-gray-400 text-lg">
              Unlock the blueprint generator by signing up with Google or requesting a magic link so you can start
              building immediately.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              disabled={!hasGoogleProvider}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base rounded-lg transition-all disabled:opacity-50"
            >
              Continue with Google
            </button>

            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-400 text-sm mb-3">Or sign up with your email</p>
              {hasEmailProvider ? (
                <form className="space-y-3" onSubmit={handleEmailSubmit}>
                  <label className="block text-xs uppercase tracking-wider text-gray-400">Work Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                    placeholder="you@company.com"
                  />
                  <button
                    type="submit"
                    className="w-full px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                    disabled={emailState === 'sending'}
                  >
                    {emailState === 'sending' ? 'Sending magic link...' : 'Send magic link'}
                  </button>
                  {message && (
                    <p className={`text-sm ${emailState === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {message}
                    </p>
                  )}
                </form>
              ) : (
                <p className="text-sm text-gray-500">
                  Email magic link sign-up is not available yet. Use Google to get started instantly.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 text-center space-y-2 text-sm text-gray-400">
            <p>Already have an account? You can sign in again with Google above.</p>
            <Link href="/landing" className="text-blue-400 underline">
              Back to landing page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
