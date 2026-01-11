import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About VibeCode Mentor - The Future of Vibecoding',
  description: 'Learn about VibeCode Mentor, the AI-powered blueprint generator built by Abdulmuiz Adeyemo. Discover our mission to democratize production-grade software architecture and how we use Mistral AI to generate 99.9% accurate blueprints.',
  keywords: [
    'About VibeCode',
    'Abdulmuiz Adeyemo',
    'vibecoding platform',
    'AI blueprint generator',
    'software architecture',
    'creator',
    'engineer expertise'
  ],
  openGraph: {
    title: 'About VibeCode Mentor - AI-Powered Blueprint Generator',
    description: 'Meet the creator and learn the technology behind VibeCode Mentor. Discover how Mistral AI powers production-ready architecture generation.',
    url: 'https://vibecodementor.app/about',
    type: 'website',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
