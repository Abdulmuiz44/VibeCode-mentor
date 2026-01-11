'use client';

export default function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VibeCode Mentor - AI Project Blueprint Generator',
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
    description: 'The premier Vibecoding platform and AI-powered project blueprint generator. Transform your ideas into production-ready code with Mistral AI. Generate complete project blueprints, technical specifications, and 30-minute implementation plans.',
    features: [
      'AI Blueprint Generation Engine',
      'AI Chat Assistant for Architecture Guidance',
      'Tech Stack Recommendations',
      '30-Minute Implementation Roadmaps',
      'Professional Templates (10+)',
      'PDF, Markdown, and JSON Export',
      'GitHub Integration and Repository Creation',
      'Cloud Sync with Real-time Collaboration',
      'Advanced Analytics Dashboard',
      'Custom Prompts Library',
    ],
    screenshot: 'https://vibecodementor.app/screenshot-1.png',
  };

  // Enhanced: HowTo Schema for Vibecoding workflow
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Start Vibecoding with VibeCode Mentor',
    description: 'Learn the complete vibecoding workflow using VibeCode Mentor to generate professional project blueprints and implementation plans.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Define Your Project Idea',
        text: 'Clearly articulate your project vision, target users, and core features you want to build.',
        image: 'https://vibecodementor.app/steps/step-1.png',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Generate Blueprint with AI',
        text: 'Use VibeCode Mentor to instantly generate a comprehensive architectural blueprint, database schema, and tech stack recommendations powered by Mistral AI.',
        image: 'https://vibecodementor.app/steps/step-2.png',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Refine with AI Chat Assistant',
        text: 'Chat with the AI to explore architectural decisions, ask questions about tech choices, and refine your blueprint based on specific requirements.',
        image: 'https://vibecodementor.app/steps/step-3.png',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Follow the 30-Minute Roadmap',
        text: 'Implement your blueprint following the structured 30-minute implementation plan, leveraging your favorite AI coding assistant.',
        image: 'https://vibecodementor.app/steps/step-4.png',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Export and Deploy',
        text: 'Export your blueprint as PDF, Markdown, or JSON. Push to GitHub. Deploy your production-ready project.',
        image: 'https://vibecodementor.app/steps/step-5.png',
      },
    ],
  };

  // Enhanced: Feature schema for core capabilities
  const featureSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'VibeCode Mentor',
    description: 'AI Project Blueprint Generator and Vibecoding Platform',
    has: [
      {
        '@type': 'Text',
        name: 'Blueprint Generation Engine',
        description: 'Mistral AI-powered generation of comprehensive project blueprints including architecture diagrams, database schemas, API specifications, and deployment strategies. Instant production-ready plans.',
      },
      {
        '@type': 'Text',
        name: 'Tech Stack Recommendation Engine',
        description: 'Intelligent recommendations for optimal technology stacks based on your project requirements. Includes trade-off analysis, scalability considerations, and cost implications for Next.js, .NET, Django, React, Vue, and more.',
      },
      {
        '@type': 'Text',
        name: '30-Minute Project Planning System',
        description: 'Structured implementation roadmap that breaks down your entire project into actionable 5-minute phases with clear milestones and dependencies for rapid MVP development.',
      },
    ],
  };

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VibeCode Mentor',
    url: 'https://vibecodementor.app',
    logo: 'https://vibecodementor.app/logo.png',
    description: 'The premier platform for vibecoding—where developers focus on creative vision while AI handles implementation.',
    founder: {
      '@type': 'Person',
      name: 'Abdulmuiz Adeyemo',
      url: 'https://github.com/Abdulmuiz44',
      sameAs: [
        'https://github.com/Abdulmuiz44',
        'https://linkedin.com/in/abdulmuiz-adeyemo',
      ],
    },
    sameAs: [
      'https://github.com/Abdulmuiz44/VibeCode-mentor',
      'https://twitter.com/AbdMuizAdeyemo',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'contact@vibecodementor.app',
    },
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

  // Enhanced: FAQPage schema targeting conversational AI queries
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Vibecoding?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vibecoding is a modern software development paradigm coined by Andrej Karpathy where developers focus on the high-level creative direction—the "vibe"—while using AI tools to handle implementation details. It shifts development focus from syntax-writing to vision-guided AI direction. VibeCode Mentor is the first platform specifically designed to power this workflow by generating professional architectural blueprints.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I start Vibecoding?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'To start Vibecoding, you need a clear project vision and an AI-powered tool like VibeCode Mentor. Visit vibecodementor.app, sign up for free, describe your project idea, and the AI generates a comprehensive architectural blueprint with tech stack recommendations and a 30-minute implementation roadmap. You can then chat with the AI to refine architectural decisions before using your favorite AI coding assistant to implement.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best tech stack for AI-generated apps?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The best tech stack depends on your project type, but for AI-generated applications in 2025 we recommend: Frontend: Next.js 15 with React 19 for production-ready UIs; Backend: .NET 9 for enterprise robustness or Node.js for rapid development; Database: PostgreSQL for relational data with strong ACID guarantees; AI Integration: Mistral AI or OpenAI APIs; Deployment: Docker containerization with cloud platforms like Vercel or Azure. VibeCode Mentor provides detailed recommendations for your specific project.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Vibecoding the future of programming?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Vibecoding represents a major shift in how software gets built. As AI coding assistants become more powerful, the bottleneck shifts from implementation (which AI handles well) to architecture and vision (which requires human judgment). Vibecoding empowers developers to move 10x faster, lowers the barrier to entry for new creators, and lets experienced developers focus on product design rather than syntax. We expect Vibecoding to become the dominant development methodology by 2026.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I use VibeCode Mentor blueprints with any AI coding assistant?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, absolutely. VibeCode Mentor generates platform-agnostic blueprints that work with any AI coding assistant including Claude, ChatGPT, GitHub Copilot, Codeium, or local LLMs. The blueprints provide architecture, database schemas, and implementation guides that you can feed to your preferred AI assistant. You can export blueprints as Markdown, PDF, or JSON for easy integration.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why use a blueprint generator instead of just asking AI to build my app?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'While AI can generate code, it often produces architectures that don\'t scale, have security issues, or lack proper structure. VibeCode Mentor uses professional architectural patterns and best practices to generate production-ready blueprints. The AI also provides a 30-minute implementation roadmap, database schemas, and API specifications—everything you need to ensure quality. Blueprints serve as a contract between you and your AI assistant, dramatically improving code quality.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate are the generated blueprints?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'VibeCode Mentor blueprints are highly accurate because they are generated using Mistral AI with specialized prompts for software architecture. Every blueprint includes validated architectural patterns from system design interviews, enterprise applications, and open-source best practices. The AI recommends tech stacks based on 2024-2025 market data and scalability characteristics. Blueprints have been used successfully by 5,000+ developers and companies to ship production applications.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens if I need to change the architecture after generation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'VibeCode Mentor includes an AI Chat Assistant specifically for this. After generating a blueprint, you can ask questions and request modifications. The AI will help you explore different architectural approaches, explain trade-offs, and update the blueprint accordingly. You have unlimited revisions included in the Pro plan, and all changes are automatically synced across devices.',
        },
      },
    ],
  };

  return (
    <>
      {/* SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Organization Schema with Founder Info for E-E-A-T */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteData) }}
      />
      {/* HowTo Schema for Vibecoding workflow */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {/* Product Schema with Features */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featureSchema) }}
      />
      {/* FAQPage Schema for Answer Engine Optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
