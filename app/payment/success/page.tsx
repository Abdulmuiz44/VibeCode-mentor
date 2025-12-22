'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

type PricingTier = 'monthly' | 'annual';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [pricingTier, setPricingTier] = useState<PricingTier>('monthly');

  useEffect(() => {
    // Get pricing tier from localStorage (saved during checkout)
    const savedPricingTier = sessionStorage.getItem('checkout-pricing-tier') as PricingTier | null;
    if (savedPricingTier) {
      setPricingTier(savedPricingTier);
      sessionStorage.removeItem('checkout-pricing-tier');
    }

    // Wait for webhook to process (usually 1-2 seconds)
    const processPayment = async () => {
      try {
        // Refresh session to get updated Pro status from webhook
        await updateSession();
        setIsLoading(false);
      } catch (error) {
        console.error('Error refreshing session:', error);
        setIsLoading(false);
      }
    };

    // Give webhook time to process
    const timer = setTimeout(processPayment, 2000);
    return () => clearTimeout(timer);
  }, [updateSession]);

  // Auto-redirect to home page after 5 seconds
  useEffect(() => {
    if (!isLoading && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0 && !isLoading) {
      router.push('/');
    }
  }, [countdown, isLoading, router]);

  // Manual redirect button
  const handleContinue = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-black p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gray-950/80 backdrop-blur shadow-2xl p-8 text-center space-y-6 animate-in fade-in">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
            <div className="relative text-6xl">✓</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white">
          Welcome to VibeCode Mentor Pro!
        </h1>

        {/* Message */}
        <p className="text-gray-300 space-y-4">
          <span className="block font-semibold text-lg">
            Thank you for upgrading! 🎉
          </span>

          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-3">
            <span className="block text-sm font-semibold text-purple-200">
              {pricingTier === 'annual' ? '$50/year' : '$5/month'} Pro Plan
            </span>
            <span className="block text-xs text-gray-300 mt-1">
              {pricingTier === 'annual'
                ? 'Billed annually ($4.17/month equivalent)'
                : 'Billed monthly, cancel anytime'}
            </span>
          </div>

          <span className="block text-sm">
            Your subscription is now active and ready to use. A confirmation email has been sent to your account.
          </span>

          {/* Features List */}
          <div className="text-left bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex gap-3 items-start">
              <span className="text-purple-400 font-bold">✓</span>
              <span className="text-sm text-gray-200">Unlimited blueprint generations + AI chat</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-purple-400 font-bold">✓</span>
              <span className="text-sm text-gray-200">Save unlimited custom prompts and history</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-purple-400 font-bold">✓</span>
              <span className="text-sm text-gray-200">Export to PDF, Markdown, or GitHub</span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-purple-400 font-bold">✓</span>
              <span className="text-sm text-gray-200">Priority support and early feature access</span>
            </div>
          </div>
        </p>

        {/* Countdown */}
        <div className="text-sm text-gray-400">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-purple-500 animate-bounce"></span>
              <span>Processing your upgrade...</span>
              <span className="inline-block h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          ) : (
            <span>Redirecting in {countdown}s...</span>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white font-semibold transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Continue to Dashboard'}
        </button>

        {/* Back to Home Link */}
        <button
          onClick={() => router.push('/')}
          className="w-full rounded-2xl border border-white/20 px-6 py-3 text-gray-300 font-semibold hover:bg-white/5 transition"
        >
          Back to Home
        </button>

        {/* Pro Status Badge */}
        {session?.user && (
          <div className="pt-4 border-t border-white/10">
            <div className="inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-full px-4 py-2 text-sm text-purple-300 font-semibold">
              ✨ Pro Member ✨
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
