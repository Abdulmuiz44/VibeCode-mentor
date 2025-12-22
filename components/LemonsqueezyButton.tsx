'use client';

import { useSession } from 'next-auth/react';
import { useState, useCallback, useRef } from 'react';

type PricingTier = 'monthly' | 'annual';

interface LemonsqueezyButtonProps {
  email?: string;
  pricingTier?: PricingTier;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function LemonsqueezyButton({
  email: externalEmail,
  pricingTier = 'monthly',
  onSuccess,
  onError,
}: LemonsqueezyButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checkoutAbortRef = useRef<AbortController | null>(null);

  const handleCheckout = useCallback(async () => {
    const email = externalEmail || session?.user?.email;
    
    if (!email) {
      const errorMsg = 'Email is required for checkout';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Prevent multiple simultaneous requests
    if (checkoutAbortRef.current) {
      checkoutAbortRef.current.abort();
    }
    checkoutAbortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: session?.user?.name || email.split('@')[0],
          userId: session?.user?.id,
          pricingTier,
        }),
        signal: checkoutAbortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Store checkout session data for recovery
        sessionStorage.setItem('checkout-pending', JSON.stringify({
          email,
          timestamp: Date.now(),
          checkoutUrl: data.checkoutUrl,
        }));
        
        // Store pricing tier for success page
        sessionStorage.setItem('checkout-pricing-tier', pricingTier);
        
        // Prevent page navigation interruption
        const href = data.checkoutUrl;
        // Use a slight delay to ensure storage is written
        setTimeout(() => {
          window.location.href = href;
        }, 50);
        return;
      }

      throw new Error(data.error || 'Unable to start checkout');
    } catch (err) {
      // Don't treat aborted requests as errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to start checkout';
      console.error('Lemonsqueezy checkout error:', err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [externalEmail, session?.user?.email, session?.user?.name, session?.user?.id, pricingTier, onError]);

  return (
    <div className="w-full space-y-3">
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm animate-in fade-in">
          {error}
        </div>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading || !session?.user?.email}
        className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-center text-white font-semibold transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Start Lemonsqueezy checkout"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
            Redirecting to checkout…
          </span>
        ) : pricingTier === 'annual' ? (
          'Checkout - $50/year'
        ) : (
          'Checkout - $5/month'
        )}
      </button>
      <p className="text-xs text-center text-gray-400">
        Secure payment via Lemonsqueezy. You will be redirected to complete payment.
      </p>
    </div>
  );
}
