import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ProBadge from "@/components/ProBadge";
import AuthButton from "@/components/AuthButton";
import UsageCounter from "@/components/UsageCounter";
import PWAInstall from "@/components/PWAInstall";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import StructuredData from "@/components/StructuredData";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import NextAuthProvider from "@/components/NextAuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeCode Mentor - AI Project Blueprint Generator",
  description: "Generate complete project blueprints with AI guidance from Mistral AI. Get detailed technical specifications, tech stacks, and step-by-step implementation plans.",
  keywords: ["AI", "project blueprint", "code generator", "Mistral AI", "development tools", "software planning"],
  authors: [{ name: "VibeCode Mentor Team" }],
  creator: "VibeCode Mentor",
  publisher: "VibeCode Mentor",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VibeCode",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vibecode-mentor.vercel.app",
    title: "VibeCode Mentor - AI Project Blueprint Generator",
    description: "Generate complete project blueprints with AI guidance from Mistral AI",
    siteName: "VibeCode Mentor",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeCode Mentor - AI Project Blueprint Generator",
    description: "Generate complete project blueprints with AI guidance from Mistral AI",
    creator: "@vibecode",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#8b5cf6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <StructuredData />
      </head>
      <body className="antialiased min-h-screen bg-black text-white">
        <NextAuthProvider>
          {/* Navigation Header */}
          <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  VibeCode Mentor
                </span>
              </Link>

              <nav className="flex items-center gap-2 md:gap-4">
                <UsageCounter />
                <ProBadge />
                <Link
                  href="/templates"
                  className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                  <span className="hidden sm:inline">Templates</span>
                </Link>
                <Link
                  href="/prompts"
                  className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="hidden sm:inline">Prompts</span>
                </Link>
                <Link
                  href="/history"
                  className="px-3 md:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">History</span>
                </Link>
                <AuthButton />
              </nav>
            </div>
          </header>

          {children}
          
          {/* PWA Install Prompt */}
          <PWAInstall />
          
          {/* Keyboard Shortcuts */}
          <KeyboardShortcuts />
          
          {/* Analytics */}
          <Analytics />
          <SpeedInsights />
        </NextAuthProvider>
      </body>
    </html>
  );
}
