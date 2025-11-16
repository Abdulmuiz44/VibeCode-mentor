export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'saas' | 'ecommerce' | 'ai' | 'other';
  icon: string;
  prompt: string;
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  isPro: boolean;
}

export const templates: Template[] = [
  {
    id: 'ecommerce-full',
    name: 'E-Commerce Platform',
    description: 'Full-featured online store with payments, inventory, and admin panel',
    category: 'ecommerce',
    icon: '🛒',
    prompt: 'Build a complete e-commerce platform with Next.js 14, Stripe payments, Prisma with PostgreSQL, real-time inventory tracking, admin dashboard with analytics, email notifications, product search with filters, shopping cart, wishlist, order management, and mobile-responsive design.',
    tags: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma', 'Tailwind'],
    complexity: 'advanced',
    estimatedTime: '4-6 weeks',
    isPro: false,
  },
  {
    id: 'saas-starter',
    name: 'SaaS Starter Kit',
    description: 'Production-ready SaaS boilerplate with auth, billing, and multi-tenancy',
    category: 'saas',
    icon: '🚀',
    prompt: 'Create a SaaS starter kit with Next.js 14 App Router, Clerk authentication, Stripe subscriptions with multiple tiers, multi-tenant architecture with team workspaces, role-based access control (RBAC), PostgreSQL with Prisma, admin dashboard, usage analytics, API rate limiting, webhook handlers, email notifications with Resend, and comprehensive testing setup.',
    tags: ['SaaS', 'Auth', 'Stripe', 'Multi-tenant', 'RBAC'],
    complexity: 'advanced',
    estimatedTime: '6-8 weeks',
    isPro: true,
  },
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot Platform',
    description: 'Intelligent chatbot with conversation memory and RAG',
    category: 'ai',
    icon: '🤖',
    prompt: 'Build an AI chatbot platform using Next.js 14, OpenAI GPT-4, Pinecone vector database for RAG (Retrieval Augmented Generation), conversation history with Redis, streaming responses, file upload for context, customizable system prompts, chat analytics, API for integration, and beautiful chat UI with markdown support.',
    tags: ['AI', 'OpenAI', 'RAG', 'Pinecone', 'Streaming'],
    complexity: 'advanced',
    estimatedTime: '3-4 weeks',
    isPro: true,
  },
  {
    id: 'mobile-social',
    name: 'Social Media App',
    description: 'Mobile-first social network with real-time features',
    category: 'mobile',
    icon: '📱',
    prompt: 'Create a mobile-first social media app with React Native or Next.js PWA, real-time posts and comments using WebSockets, image/video upload with AWS S3, user profiles and follow system, likes and reactions, notifications (push for mobile), infinite scroll feed, stories feature, direct messaging, and content moderation.',
    tags: ['React Native', 'WebSockets', 'S3', 'Real-time'],
    complexity: 'advanced',
    estimatedTime: '5-7 weeks',
    isPro: false,
  },
  {
    id: 'task-manager',
    name: 'Task Management Tool',
    description: 'Collaborative project management with Kanban boards',
    category: 'saas',
    icon: '✅',
    prompt: 'Build a task management application like Trello/Asana with Next.js 14, drag-and-drop Kanban boards using dnd-kit, real-time collaboration with WebSockets, task assignments and due dates, file attachments, comments and activity feed, project templates, calendar view, time tracking, team workspaces, and mobile-responsive design.',
    tags: ['Kanban', 'Real-time', 'Collaboration', 'DnD'],
    complexity: 'intermediate',
    estimatedTime: '3-4 weeks',
    isPro: false,
  },
  {
    id: 'blog-cms',
    name: 'Blog & CMS Platform',
    description: 'SEO-optimized blog with headless CMS',
    category: 'web',
    icon: '📝',
    prompt: 'Create a blog and CMS platform with Next.js 14 App Router, MDX support for rich content, Contentful or Sanity as headless CMS, SEO optimization with metadata, sitemap generation, RSS feed, author profiles, categories and tags, search functionality, comments system, analytics integration, newsletter signup, and beautiful typography.',
    tags: ['Blog', 'CMS', 'MDX', 'SEO', 'Contentful'],
    complexity: 'intermediate',
    estimatedTime: '2-3 weeks',
    isPro: false,
  },
  {
    id: 'video-streaming',
    name: 'Video Streaming Platform',
    description: 'YouTube-like platform with live streaming',
    category: 'web',
    icon: '🎥',
    prompt: 'Build a video streaming platform similar to YouTube with Next.js 14, video upload and transcoding using AWS MediaConvert or Mux, HLS/DASH adaptive streaming, live streaming with RTMP, video player with custom controls, playlists, subscriptions, comments, likes/dislikes, view analytics, recommendations algorithm, and monetization options.',
    tags: ['Video', 'Streaming', 'AWS', 'Mux', 'RTMP'],
    complexity: 'advanced',
    estimatedTime: '6-8 weeks',
    isPro: true,
  },
  {
    id: 'fitness-tracker',
    name: 'Fitness Tracker App',
    description: 'Health and workout tracking with charts',
    category: 'mobile',
    icon: '💪',
    prompt: 'Create a fitness tracking app with Next.js PWA or React Native, workout logging with exercise library, progress tracking with charts using Recharts, nutrition tracking with calorie counter, goal setting and achievements, body measurements tracking, workout plans and routines, rest timer, social features to share progress, and Apple Health/Google Fit integration.',
    tags: ['Fitness', 'PWA', 'Charts', 'Mobile', 'Health'],
    complexity: 'intermediate',
    estimatedTime: '3-4 weeks',
    isPro: false,
  },
  {
    id: 'invoice-generator',
    name: 'Invoice & Billing System',
    description: 'Professional invoicing with payment tracking',
    category: 'saas',
    icon: '💰',
    prompt: 'Build an invoice and billing system with Next.js 14, PDF generation for invoices using React-PDF, client management, recurring invoices, payment tracking with Stripe integration, expense tracking, financial reports and analytics, multi-currency support, tax calculations, email reminders for overdue invoices, and mobile-responsive design.',
    tags: ['Invoicing', 'PDF', 'Stripe', 'Finance', 'Reports'],
    complexity: 'intermediate',
    estimatedTime: '3-4 weeks',
    isPro: false,
  },
  {
    id: 'learning-platform',
    name: 'Online Learning Platform',
    description: 'LMS with courses, quizzes, and certificates',
    category: 'saas',
    icon: '🎓',
    prompt: 'Create an online learning management system (LMS) with Next.js 14, course creation and management, video lessons with progress tracking, quizzes and assessments, certificates generation, student dashboard with enrolled courses, instructor dashboard with analytics, discussion forums, live classes with Zoom integration, payment integration for paid courses, and course recommendations.',
    tags: ['LMS', 'Education', 'Video', 'Certificates', 'Quizzes'],
    complexity: 'advanced',
    estimatedTime: '5-6 weeks',
    isPro: true,
  },
];

export const getTemplatesByCategory = (category: Template['category']) => {
  return templates.filter(t => t.category === category);
};

export const getFreeTemplates = () => {
  return templates.filter(t => !t.isPro);
};

export const getProTemplates = () => {
  return templates.filter(t => t.isPro);
};

export const getTemplateById = (id: string) => {
  return templates.find(t => t.id === id);
};
