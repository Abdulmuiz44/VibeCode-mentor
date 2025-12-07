'use client';

export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VibeCode Mentor - The Ultimate Vibecoding Tool',
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
    description: 'The premier Vibecoding platform and AI-powered project blueprint generator. Transform your ideas into code with Mistral AI. Generate complete project blueprints, technical specifications, and implementation plans.',
    features: [
      'Vibecoding Assistant',
      'AI Blueprint Generation',
      'Chat with AI Assistant',
      'Professional Templates',
      'PDF Export',
      'GitHub Integration',
      'Cloud Sync',
      'Analytics Dashboard',
    ],
    screenshot: 'https://vibecodementor.app/screenshot-1.png',
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VibeCode Mentor',
    url: 'https://vibecodementor.app',
    logo: 'https://vibecodementor.app/logo.png',
    sameAs: [
      'https://github.com/Abdulmuiz44/VibeCode-mentor',
    ],
  };

  const webSiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VibeCode Mentor',
    url: 'https://vibecodementor.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://vibecodementor.app/templates?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Vibecoding?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vibecoding is a modern software development paradigm coined by Andrej Karpathy where developers focus on the high-level creative direction (the "vibe") while using AI tools to handle the implementation details. It shifts the focus from writing syntax to guiding AI models to build robust applications.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I start Vibecoding?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'To start Vibecoding, you need a clear idea and an AI-powered tool like VibeCode Mentor. VibeCode Mentor generates professional architectural blueprints and implementation plans, allowing you to effectively guide AI coding assistants to build your project exactly as you envision it.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Vibecoding the future of programming?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Vibecoding represents the future of programming where the barrier to entry is lowered, and productivity is massively increased. It empowers both improved developers to move faster and new creators to build complex software without deep coding knowledge.',
        },
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
