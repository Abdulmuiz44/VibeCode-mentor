'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function UsageCounter() {
  const { user, isPro } = useAuth();
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPro) {
      setLoading(false);
      return;
    }

    async function fetchUsage() {
      try {
        const response = await fetch('/api/usage');
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [user, isPro]);

  if (loading) {
    return (
      <div className="text-sm text-gray-400 animate-pulse">
        Loading...
      </div>
    );
  }

  if (isPro) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
        <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          ⚡ Unlimited
        </span>
      </div>
    );
  }

  if (!usage) return null;

  const remaining = usage.limit - usage.current;
  const percentage = (usage.current / usage.limit) * 100;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          <svg className="w-8 h-8 transform -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - percentage / 100)}`}
              className={`${
                percentage >= 90 ? 'text-red-500' : 
                percentage >= 70 ? 'text-yellow-500' : 
                'text-green-500'
              } transition-all duration-300`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {remaining}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-white">
            {remaining}/{usage.limit}
          </span>
          <span className="text-xs text-gray-400">
            free left
          </span>
        </div>
      </div>
    </div>
  );
}
