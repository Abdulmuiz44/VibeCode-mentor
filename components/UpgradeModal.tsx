'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock Blueprint Building</DialogTitle>
          <DialogDescription>
            Build production-ready apps from your blueprints
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade} 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Loading...' : 'Upgrade to Pro'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
