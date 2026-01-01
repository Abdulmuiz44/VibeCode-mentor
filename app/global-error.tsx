"use client";

import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // Sentry integration disabled - causing build issues
    // TODO: Re-enable after resolving Next.js 14.2.x compatibility
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4">Oops!</h1>
          <p className="text-gray-400 mb-6">Something went wrong. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}