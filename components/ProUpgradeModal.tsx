'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import PayPalButton from './PayPalButton';

type PaymentMethod = 'flutterwave' | 'paypal' | 'other';

interface ProUpgradeModalContextValue {
  openUpgradeModal: (options?: { source?: string }) => void;
}

const ProUpgradeModalContext = createContext<ProUpgradeModalContextValue | null>(null);

export function ProUpgradeModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  const openUpgradeModal = useCallback((options?: { source?: string }) => {
    setSource(options?.source ?? '');
    setIsOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsOpen(false);
    setEmailError('');
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prefill = session?.user?.email ?? '';
    setEmail(prefill);
  }, [isOpen, session?.user?.email]);

  const handleCheckout = async () => {
    const resolvedEmail = email.trim() || session?.user?.email;
    if (!resolvedEmail) {
      setEmailError('Email is required to start checkout');
      return;
    }

    setEmailError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resolvedEmail,
          name: session?.user?.name || resolvedEmail.split('@')[0],
          userId: session?.user?.id,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        localStorage.setItem('checkout-email', resolvedEmail);
        if (source) {
          localStorage.setItem('checkout-source', source);
        }
        window.location.href = data.checkoutUrl;
        return;
      }

      throw new Error(data.error || 'Unable to start checkout');
    } catch (err) {
      console.error('Checkout error:', err);
      setEmailError((err as Error).message || 'Failed to start checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue = useMemo(() => ({ openUpgradeModal }), [openUpgradeModal]);

  const features = [
    'Unlimited blueprint generations + AI chat',
    'Save unlimited custom prompts and history',
    'Export to PDF, Markdown, or GitHub',
    'Priority support and early feature access',
  ];

  return (
    <ProUpgradeModalContext.Provider value={contextValue}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-gray-950 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 sticky top-0 bg-gray-950 z-10">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-purple-400">VibeCode Pro</p>
                <h3 className="text-2xl font-semibold text-white">Unlock the full mentor experience</h3>
                {source && <p className="text-xs text-gray-400">Starting from: {source}</p>}
              </div>
              <button
                type="button"
                onClick={closeUpgradeModal}
                className="text-gray-400 transition hover:text-white"
                aria-label="Close upgrade modal"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-3 md:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature} className="rounded-2xl border border-white/5 bg-gradient-to-br from-purple-900/60 to-pink-900/60 p-4 text-sm text-gray-200">
                    {feature}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-300">Choose payment method</p>
                <div className="mt-3 space-y-3">
                  {/* PayPal Option */}
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${paymentMethod === 'paypal' ? 'border-purple-500/70 bg-purple-500/10' : 'border-white/10 bg-white/5'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-white">PayPal</p>
                      <p className="text-xs text-gray-400">Pay securely with PayPal.</p>
                    </div>
                  </label>

                  {/* Flutterwave Option */}
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${paymentMethod === 'flutterwave' ? 'border-purple-500/70 bg-purple-500/10' : 'border-white/10 bg-white/5'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value="flutterwave"
                      checked={paymentMethod === 'flutterwave'}
                      onChange={() => setPaymentMethod('flutterwave')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-semibold text-white">Flutterwave</p>
                      <p className="text-xs text-gray-400">Card + bank transfer support today.</p>
                    </div>
                  </label>

                  {/* Other Option */}
                  <label
                    className="flex cursor-not-allowed items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <input type="radio" disabled className="mt-1" />
                    <div>
                      <p className="font-semibold text-white">Other (coming soon)</p>
                      <p className="text-xs text-gray-400">We&apos;ll add more payment partners shortly.</p>
                    </div>
                  </label>
                </div>
              </div>

              {paymentMethod === 'flutterwave' && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-300">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                    {emailError && <p className="mt-2 text-xs text-red-400">{emailError}</p>}
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-center text-white transition hover:scale-[1.01] disabled:opacity-50"
                    >
                      {isSubmitting ? 'Redirecting to checkout…' : 'Checkout - $5/month'}
                    </button>
                    <p className="text-xs text-gray-400">
                      You&apos;ll be charged securely through Flutterwave before the success page confirms your Pro access.
                    </p>
                  </div>
                </>
              )}

              {paymentMethod === 'paypal' && (
                <div className="mt-4">
                  <PayPalButton
                    amount="5.00"
                    amount="5.00"
                  />
                  />
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Secure payment via PayPal. You will be redirected after payment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProUpgradeModalContext.Provider>
  );
}

export function useProUpgradeModal() {
  const context = useContext(ProUpgradeModalContext);
  if (!context) {
    throw new Error('useProUpgradeModal must be used within ProUpgradeModalProvider');
  }
  return context;
}
