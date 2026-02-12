'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SocialButtons() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('returnTo') || '/build';
  
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSignIn = async () => {
    if (googleLoading || githubLoading) return;
    
    setError('');
    setSuccess('');
    setGoogleLoading(true);
    
    try {
      console.log("🔍 Initiating Google Sign In...");
      
      const result = await signIn('google', { 
        callbackUrl,
        redirect: false 
      });
      
      console.log("✅ Google Sign In Result:", result);

      if (result?.error) {
        let errorMessage = result.error;
        
        // Provide user-friendly error messages
        if (result.error === 'OAuthSignin') {
          errorMessage = 'Google sign in was cancelled. Please try again.';
        } else if (result.error === 'OAuthCallback') {
          errorMessage = 'Error connecting to Google. Please try again.';
        } else if (result.error === 'OAuthCreateAccount') {
          errorMessage = 'Could not create account with Google. Please try signing up first.';
        } else if (result.error === 'EmailCreateAccount') {
          errorMessage = 'Email already exists. Please sign in with your password.';
        } else if (result.error === 'Callback') {
          errorMessage = 'Authentication callback error. Please try again.';
        }
        
        setError(errorMessage);
        setGoogleLoading(false);
      } else if (result?.url) {
        setSuccess('Redirecting to Google...');
        console.log("🔄 Redirecting to:", result.url);
        window.location.href = result.url;
      } else {
        setError('No redirect URL received from Google. Please try again.');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      console.error("❌ Google Signin Exception:", err);
      setError('Failed to start Google sign in. Please check your connection and try again.');
      setGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    if (googleLoading || githubLoading) return;
    
    setError('');
    setSuccess('');
    setGithubLoading(true);
    
    try {
      console.log("🔍 Initiating GitHub Sign In...");

      const result = await signIn('github', { 
        callbackUrl, 
        redirect: false 
      });

      console.log("✅ GitHub Sign In Result:", result);

      if (result?.error) {
        let errorMessage = result.error;
        
        // Provide user-friendly error messages
        if (result.error === 'OAuthSignin') {
          errorMessage = 'GitHub sign in was cancelled. Please try again.';
        } else if (result.error === 'OAuthCallback') {
          errorMessage = 'Error connecting to GitHub. Please try again.';
        } else if (result.error === 'OAuthCreateAccount') {
          errorMessage = 'Could not create account with GitHub. Please try signing up first.';
        } else if (result.error === 'EmailCreateAccount') {
          errorMessage = 'Email already exists. Please sign in with your password.';
        } else if (result.error === 'Callback') {
          errorMessage = 'Authentication callback error. Please try again.';
        }
        
        setError(errorMessage);
        setGithubLoading(false);
      } else if (result?.url) {
        setSuccess('Redirecting to GitHub...');
        console.log("🔄 Redirecting to:", result.url);
        window.location.href = result.url;
      } else {
        setError('No redirect URL received from GitHub. Please try again.');
        setGithubLoading(false);
      }
    } catch (err: any) {
      console.error("❌ GitHub Signin Exception:", err);
      setError('Failed to start GitHub sign in. Please check your connection and try again.');
      setGithubLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-8">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#0a0a0a] text-gray-500 font-medium">Or continue with</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {success}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || githubLoading}
          type="button"
          className="group relative flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/20 hover:shadow-lg hover:shadow-white/5 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {googleLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span className="truncate">
            {googleLoading ? 'Connecting...' : 'Google'}
          </span>
        </button>

        <button
          onClick={handleGitHubSignIn}
          disabled={googleLoading || githubLoading}
          type="button"
          className="group relative flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/20 hover:shadow-lg hover:shadow-white/5 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {githubLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          )}
          <span className="truncate">
            {githubLoading ? 'Connecting...' : 'GitHub'}
          </span>
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-gray-400 hover:text-white transition-colors underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-gray-400 hover:text-white transition-colors underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}