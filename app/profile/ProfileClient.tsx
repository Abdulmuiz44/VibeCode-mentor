'use client';

import { useProUpgradeModal } from '@/components/ProUpgradeModal';

export default function ProfileClient() {
    const { openUpgradeModal } = useProUpgradeModal();

    return (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
            <div>
                <h3 className="font-semibold text-purple-200">Unlock Unlimited</h3>
                <p className="text-sm text-purple-300/70">Remove limits and get advanced features.</p>
            </div>
            <button
                onClick={() => openUpgradeModal({ source: 'Profile Page' })}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
                Upgrade
            </button>
        </div>
    );
}
