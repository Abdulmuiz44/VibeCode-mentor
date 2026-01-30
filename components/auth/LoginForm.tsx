'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('returnTo') || '/build';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (result.error.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.');
        } else if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(result.error);
        }
        setLoading(false);
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Link href="/auth/forgot-password" className="text-xs text-gray-400 hover:text-white transition-colors">
            Forgot password?
          </Link>
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
        disabled={loading}
        className="w-full py-3.5 px-4 bg-white hover:bg-gray-100 text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing In...
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-white font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </form>
  );
}