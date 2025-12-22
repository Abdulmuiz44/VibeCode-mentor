'use client';

import { useProUpgradeModal } from '@/components/ProUpgradeModal';

export default function ProUpgradeButton() {
  const { openUpgradeModal } = useProUpgradeModal();

  return (
    <button
      type="button"
      onClick={() => openUpgradeModal({ source: 'Landing Page' })}
      className="block w-full cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-center font-bold text-white transition hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/50"
    >
      Upgrade to Pro →
    </button>
  );
}
