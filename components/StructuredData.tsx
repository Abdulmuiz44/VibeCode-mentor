'use client';

export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VibeCode Mentor',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
    },
    description: 'AI-powered project blueprint generator with Mistral AI. Generate complete project blueprints with detailed technical specifications, tech stacks, and step-by-step implementation plans.',
    features: [
      'AI Blueprint Generation',
      'Chat with AI Assistant',
      'Professional Templates',
      'PDF Export',
      'GitHub Integration',
      'Cloud Sync',
      'Analytics Dashboard',
    ],
    screenshot: 'https://vibecode-mentor.vercel.app/screenshot-1.png',
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VibeCode Mentor',
    url: 'https://vibecode-mentor.vercel.app',
    logo: 'https://vibecode-mentor.vercel.app/icon-512x512.svg',
    sameAs: [
      'https://github.com/vibecode-mentor',
    ],
  };

  const webSiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VibeCode Mentor',
    url: 'https://vibecode-mentor.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://vibecode-mentor.vercel.app/templates?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteData) }}
      />
    </>
  );
}
