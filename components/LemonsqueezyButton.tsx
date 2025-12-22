'use client';

import { useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';

type PricingTier = 'monthly' | 'annual';

interface LemonsqueezyButtonProps {
  email?: string;
  pricingTier?: PricingTier;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Direct LemonSqueezy checkout URL
const LEMONSQUEEZY_CHECKOUT_URL = 'https://vibe-code-mentor.lemonsqueezy.com/checkout/buy/f597bf10-3530-4b43-88c8-8b74eb4134c7';

export default function LemonsqueezyButton({
  email: externalEmail,
  pricingTier = 'monthly',
  onSuccess,
  onError,
}: LemonsqueezyButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleCheckout = useCallback(() => {
    const email = externalEmail || session?.user?.email;
    
    if (!email) {
      const errorMsg = 'Email is required for checkout';
      onError?.(errorMsg);
      return;
    }

    setLoading(true);

    // Store pricing tier for success page
    sessionStorage.setItem('checkout-pricing-tier', pricingTier);
    
    // Redirect directly to LemonSqueezy checkout
    window.location.href = LEMONSQUEEZY_CHECKOUT_URL;
  }, [externalEmail, session?.user?.email, pricingTier, onError]);

  return (
    <div className="w-full space-y-3">
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
