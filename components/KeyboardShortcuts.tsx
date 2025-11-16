'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Focus on search/input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const textarea = document.getElementById('projectIdea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }

      // Cmd/Ctrl + Enter: Submit form
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }

      // Cmd/Ctrl + /: Show keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowHelp(!showHelp);
      }

      // Escape: Close help modal
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }

      // Cmd/Ctrl + 1-5: Navigate to pages
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const pages = ['/', '/templates', '/prompts', '/history', '/admin'];
        const index = parseInt(e.key) - 1;
        if (pages[index]) {
          router.push(pages[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelp, router]);

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <>
      {/* Keyboard Shortcuts Help Button */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors shadow-lg border border-gray-700"
        title="Keyboard Shortcuts"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* General Shortcuts */}
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide">General</h4>
                  <div className="space-y-2">
                    <ShortcutRow shortcut={`${modKey} + K`} description="Focus input field" />
                    <ShortcutRow shortcut={`${modKey} + Enter`} description="Generate blueprint" />
                    <ShortcutRow shortcut={`${modKey} + /`} description="Toggle this help" />
                    <ShortcutRow shortcut="Esc" description="Close modals" />
                  </div>
                </div>

                {/* Navigation Shortcuts */}
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide">Navigation</h4>
                  <div className="space-y-2">
                    <ShortcutRow shortcut={`${modKey} + 1`} description="Go to Home" />
                    <ShortcutRow shortcut={`${modKey} + 2`} description="Go to Templates" />
                    <ShortcutRow shortcut={`${modKey} + 3`} description="Go to Prompts" />
                    <ShortcutRow shortcut={`${modKey} + 4`} description="Go to History" />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <p className="text-sm text-blue-300">
                  💡 <span className="font-semibold">Pro Tip:</span> Use keyboard shortcuts to speed up your workflow and become a power user!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-300">{description}</span>
      <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400 font-mono text-xs">
        {shortcut}
      </kbd>
    </div>
  );
}
