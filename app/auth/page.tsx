'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

function AuthPageClient() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get('returnTo') ?? '/build';
  const callbackUrl = useMemo(() => returnTo || '/build', [returnTo]);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      console.error("Google Signin Error:", err);
      setError("Failed to initialize Google Sign In");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          if (result.error.includes('Email not confirmed')) {
            setError('Please verify your email address before logging in.');
          } else {
            setError('Invalid email or password. Please try again.');
          }
        } else {
          // Success! Force page reload
          window.location.href = callbackUrl;
        }
      } else {
        // Sign up with Supabase Auth
        const { supabase } = await import('@/lib/supabase');

        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        // Check if email confirmation is required (Supabase returns null session if unconfirmed)
        if (data?.user && !data.session) {
          setEmailSent(true);
          setSuccessMessage(`Confirmation email sent to ${email}. Please check your inbox.`);
        } else {
          // Auto-confirmed or disabled email confirmation
          setSuccessMessage('Account created successfully! Signing you in...');
          // Auto login via NextAuth to establish session
          const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
          });

          if (result?.ok) {
            window.location.href = callbackUrl;
          } else {
            setIsLogin(true); // Fallback to login form
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin
              ? 'Enter your details to access your account'
              : 'Sign up to start building your ideas'}
          </p>

          {successMessage && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {successMessage}
            </div>
          )}
        </div>

        {!emailSent && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/10 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isLogin
                ? 'bg-white text-black shadow-lg scale-[1.02]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${!isLogin
                ? 'bg-white text-black shadow-lg scale-[1.02]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {emailSent && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Check your inbox</h3>
              <p className="text-sm text-gray-400">
                We sent a confirmation link to <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-xs text-gray-500 mt-4">The link expires in 24 hours.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEmailSent(false);
                setSuccessMessage('');
                setEmail('');
                setPassword('');
                setName('');
                setIsLogin(true);
              }}
              className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all"
            >
              Back to Sign In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" style={{ display: emailSent ? 'none' : 'block' }}>
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none text-white placeholder-gray-600 transition-all font-medium"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none text-white placeholder-gray-600 transition-all font-medium"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Password</label>
              {isLogin && (
                <Link href="/auth/forgot-password" className="text-xs text-gray-400 hover:text-white transition-colors">
                  Forgot password?
                </Link>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none text-white placeholder-gray-600 transition-all font-medium"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-in shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 mb-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0a0a] text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/20"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {googleLoading ? 'Connecting...' : 'Google'}
          </button>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
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
      <AuthPageClient />
    </Suspense>
  );
}
