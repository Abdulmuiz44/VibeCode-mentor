import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeCode Mentor - AI Project Blueprint Generator",
  description: "Generate complete project blueprints with AI guidance from Grok",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}
