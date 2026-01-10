'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      setVerificationStatus('success');
      // Redirect to dashboard after 3 seconds
      const timeout = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return () => clearTimeout(timeout);
    }

    if (error) {
      setVerificationStatus('error');
      setErrorMessage(decodeURIComponent(error));
    }
  }, [searchParams, router]);

  if (verificationStatus === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Verifying Your Email</h1>
            <p className="text-gray-400">Please wait while we confirm your email address...</p>
          </div>
        </div>
      </main>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
            <p className="text-gray-400">Your email has been successfully confirmed. Your account is now active.</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-gray-400 text-sm">{errorMessage}</p>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-sm text-gray-500">The verification link may have expired or is invalid.</p>

            <Link
              href="/auth"
              className="inline-block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/20 transition-all text-center"
            >
              Back to Sign In
            </Link>

            <p className="text-xs text-gray-500">
              Need help?{' '}
              <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300">
                Request a new verification email
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <EmailVerifiedContent />
    </Suspense>
  );
}
