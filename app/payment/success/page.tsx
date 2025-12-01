'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function PaymentSuccessContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    async function verifyPayment() {
      try {
        // Get transaction details from URL params
        const txRef = searchParams.get('tx_ref');
        const transactionId = searchParams.get('transaction_id');
        const paymentStatus = searchParams.get('status');

        if (!txRef || paymentStatus !== 'successful') {
          setStatus('error');
          setErrorMessage('Payment confirmation missing or incomplete');
          return;
        }

        // Verify payment with backend
        const userId = session?.user?.id;
        if (!userId) {
          // For Flutterwave, user might not be logged in yet
          // We'll just show success and let them login
          setStatus('success');
          setTimeout(() => {
            router.push('/auth?returnTo=/profile');
          }, 3000);
          return;
        }

        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: transactionId || txRef,
            userId,
          }),
        });

        const data = await response.json();

        if (data.verified && data.isPro) {
          setStatus('success');
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/profile');
          }, 3000);
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setErrorMessage('Failed to verify payment. Please contact support if payment was deducted.');
      }
    }

    verifyPayment();
  }, [searchParams, router, session]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        {status === 'loading' && (
          <div className="text-center">
            <div className="mb-6">
              <svg className="animate-spin h-16 w-16 mx-auto text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h1>
            <p className="text-gray-400">Please wait while we confirm your subscription</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6">
              <svg className="h-16 w-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Welcome to Pro! 🎉</h1>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
              <p className="text-gray-300 mb-4">Your Pro subscription is now active!</p>
              <ul className="text-left space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited blueprint generations
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited custom prompts
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Export to PDF, Markdown, GitHub
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">Redirecting to your profile...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6">
              <svg className="h-16 w-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Verification Failed</h1>
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-6">
              <p className="text-gray-300 mb-2">{errorMessage}</p>
              <p className="text-gray-400 text-sm">
                If you were charged, please contact our support team with your transaction details.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/contact')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Contact Support
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Go to Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <svg className="animate-spin h-16 w-16 mx-auto text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Loading...</h1>
        </div>
      </main>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
