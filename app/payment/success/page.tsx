'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setProStatus } from '@/utils/pro';

function PaymentSuccessContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get transaction details from URL params
    const txRef = searchParams.get('tx_ref');
    const transactionId = searchParams.get('transaction_id');
    const status = searchParams.get('status');

    if (status === 'successful' && txRef) {
      // Extract email from tx_ref if stored, or use a default
      const email = localStorage.getItem('checkout-email') || 'user@vibecode.com';
      
      // Activate Pro status
      setProStatus(email, txRef);
      localStorage.removeItem('checkout-email');
      
      setStatus('success');
      
      // Redirect to history after 3 seconds
      setTimeout(() => {
        router.push('/history');
      }, 3000);
    } else {
      setStatus('error');
    }
  }, [searchParams, router]);

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
            <h1 className="text-2xl font-bold text-white mb-2">Processing Payment...</h1>
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
                  Unlimited blueprint saves
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  GitHub Gist export
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">Redirecting to your history...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6">
              <svg className="h-16 w-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Failed</h1>
            <p className="text-gray-400 mb-6">Something went wrong with your payment. Please try again.</p>
            <button
              onClick={() => router.push('/history')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Back to History
            </button>
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
