'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('returnTo') || '/build';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Sign up with Supabase Auth directly
      const { createClient } = await import('@supabase/supabase-js');

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Authentication service not configured.');
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // 2. Handle Success
      if (data?.user && !data.session) {
        // Email confirmation required
        setSuccess(true);
        setLoading(false);
      } else if (data?.session) {
        // Auto-confirmed (e.g. during development or if config allows)
        // Attempt to sign in with NextAuth immediately
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.ok) {
          window.location.href = callbackUrl;
        } else {
          setSuccess(true); // Fallback to showing check email/success message
          setLoading(false);
        }
      } else {
        setSuccess(true);
        setLoading(false);
      }

    } catch (err: any) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
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

        <Link
          href="/auth/login"
          className="block w-full py-3 px-4 bg-white hover:bg-gray-100 text-black font-bold rounded-xl transition-all text-center"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/40 outline-none text-white placeholder-gray-600 transition-all font-medium"
          placeholder="John Doe"
          required
        />
      </div>

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
        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
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
        disabled={loading}
        className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}