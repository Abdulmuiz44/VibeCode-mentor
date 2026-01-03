'use client';

import { useState } from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprintName?: string;
}

export function UpgradeModal({ isOpen, onClose, blueprintName }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Navigate to pricing page or payment flow
      window.location.href = '/pricing?upgrade=true';
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Unlock Blueprint Building</h2>
          <p className="text-sm text-gray-600">
            Build production-ready apps from your blueprints
          </p>
        </div>

        <div className="space-y-4 px-6 py-6">
          {blueprintName && (
            <p className="text-sm text-gray-600">
              Ready to build <strong>{blueprintName}</strong>?
            </p>
          )}

          <p className="text-sm text-gray-700">
            Building projects is a Pro feature. Upgrade to unlock one-click app generation with GitHub integration.
          </p>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Generate full-stack applications in minutes</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Auto-push to GitHub with semantic commits</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Production-ready code (no manual fixes needed)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Unlimited builds & projects</span>
            </li>
          </ul>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
