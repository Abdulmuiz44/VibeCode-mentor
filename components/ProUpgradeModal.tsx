'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import LemonsqueezyButton from './LemonsqueezyButton';

type PricingTier = 'monthly' | 'annual';

interface ProUpgradeModalContextValue {
    openUpgradeModal: (options?: { source?: string }) => void;
}

const ProUpgradeModalContext = createContext<ProUpgradeModalContextValue | null>(null);

export function ProUpgradeModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [source, setSource] = useState('');
    const [pricingTier, setPricingTier] = useState<PricingTier>('monthly');
    const { data: session } = useSession();

    const openUpgradeModal = useCallback((options?: { source?: string }) => {
        setSource(options?.source ?? '');
        setIsOpen(true);
    }, []);

    const closeUpgradeModal = useCallback(() => {
        setIsOpen(false);
        setPricingTier('monthly');
    }, []);

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

                            {/* Pricing Tier Selection */}
                            <div>
                                <p className="text-sm font-semibold text-gray-300 mb-3">Choose your plan</p>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {/* Monthly Plan */}
                                    <label
                                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
                                            pricingTier === 'monthly'
                                                ? 'border-purple-500/70 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="pricing-tier"
                                            value="monthly"
                                            checked={pricingTier === 'monthly'}
                                            onChange={() => setPricingTier('monthly')}
                                            className="mt-1"
                                        />
                                        <div>
                                            <p className="font-semibold text-white">Monthly</p>
                                            <p className="text-sm text-purple-300 font-bold">$5/month</p>
                                            <p className="text-xs text-gray-400">Billed monthly, cancel anytime</p>
                                        </div>
                                    </label>

                                    {/* Annual Plan */}
                                    <label
                                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition relative ${
                                            pricingTier === 'annual'
                                                ? 'border-purple-500/70 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5'
                                        }`}
                                    >
                                        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            SAVE 17%
                                        </div>
                                        <input
                                            type="radio"
                                            name="pricing-tier"
                                            value="annual"
                                            checked={pricingTier === 'annual'}
                                            onChange={() => setPricingTier('annual')}
                                            className="mt-1"
                                        />
                                        <div>
                                            <p className="font-semibold text-white">Annual</p>
                                            <p className="text-sm text-purple-300 font-bold">$50/year</p>
                                            <p className="text-xs text-gray-400">$4.17/month, billed yearly</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Lemonsqueezy Payment - Only Option */}
                            <LemonsqueezyButton
                              pricingTier={pricingTier}
                            />
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
