import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import PWAInstall from "@/components/PWAInstall";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import StructuredData from "@/components/StructuredData";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import NextAuthProvider from "@/components/NextAuthProvider";
import { ProUpgradeModalProvider } from "@/components/ProUpgradeModal";
import MainHeader from "@/components/MainHeader";
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
    url: "https://vibe-code-mentor.vercel.app/landing",
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
          <ProUpgradeModalProvider>
            <MainHeader />

            {children}

            {/* PWA Install Prompt */}
            <PWAInstall />

            {/* Keyboard Shortcuts */}
            <KeyboardShortcuts />

            {/* Analytics */}
            <Analytics />
            <SpeedInsights />
          </ProUpgradeModalProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
