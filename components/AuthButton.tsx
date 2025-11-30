'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const loading = status === 'loading';

  const handleSignIn = async () => {
    await signIn('google');
  };

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse"></div>
    );
  }

  if (!session) {
    return (
      <button
        onClick={handleSignIn}
        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-colors duration-200"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    );
  }

  const user = session.user;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={40}
            height={40}
            className="rounded-full border-2 border-purple-500"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
            {user.email?.[0].toUpperCase()}
          </div>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <p className="text-sm font-semibold text-white truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="p-2">
              <a
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                Profile & Usage
              </a>
            </div>
            <div className="border-t border-gray-800"></div>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
