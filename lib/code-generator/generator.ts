import { Blueprint, GeneratedFile, GeneratedProject, DatabaseEntity, ApiEndpoint } from './types';
import { BlueprintParser } from './blueprint-parser';
import { generatePackageJson } from './templates/package-json';
import { generateEnvExample } from './templates/env-example';
import { generateDatabaseMigrations, generateRLSPolicies } from './templates/database-migrations';
import { generateApiRouteFile } from './templates/api-route';
import { generatePageComponent, generateListComponent } from './templates/react-component';
import {
  generateNextConfig,
  generateTailwindConfig,
  generatePostCssConfig,
  generateTsconfigJson,
  generateGitignore,
  generateEslintConfig,
} from './templates/config-files';

export class CodeGenerator {
  private blueprint: Blueprint;
  private projectSlug: string;
  private dbEntities: DatabaseEntity[];
  private apiEndpoints: ApiEndpoint[];
  private features: ReturnType<typeof BlueprintParser.extractFeatures>;

  constructor(blueprint: Blueprint) {
    this.blueprint = blueprint;
    this.projectSlug = BlueprintParser.slugify(blueprint.projectName);
    this.dbEntities = BlueprintParser.parseDatabase(blueprint.databaseSchema);
    this.apiEndpoints = BlueprintParser.parseApiEndpoints(blueprint.apiEndpoints);
    this.features = BlueprintParser.extractFeatures(blueprint);
  }

  generate(): GeneratedProject {
    const files: GeneratedFile[] = [];

    // Config files
    files.push(...this.generateConfigFiles());

    // Package & dependencies
    files.push(...this.generatePackageFiles());

    // Database
    files.push(...this.generateDatabaseFiles());

    // API routes
    files.push(...this.generateApiFiles());

    // Components & pages
    files.push(...this.generateComponentFiles());

    // Documentation
    files.push(...this.generateDocumentation());

    // Lib files
    files.push(...this.generateLibFiles());

    return {
      name: this.projectSlug,
      files,
      summary: {
        totalFiles: files.length,
        technologies: this.getTechnologies(),
        apiEndpoints: this.apiEndpoints.length,
        components: this.estimateComponentCount(),
      },
    };
  }

  private generateConfigFiles(): GeneratedFile[] {
    return [
      {
        path: 'next.config.mjs',
        content: generateNextConfig(this.blueprint),
        language: 'typescript',
      },
      {
        path: 'tailwind.config.ts',
        content: generateTailwindConfig(),
        language: 'typescript',
      },
      {
        path: 'postcss.config.mjs',
        content: generatePostCssConfig(),
        language: 'typescript',
      },
      {
        path: 'tsconfig.json',
        content: generateTsconfigJson(),
        language: 'json',
      },
      {
        path: '.eslintrc.js',
        content: generateEslintConfig(),
        language: 'typescript',
      },
      {
        path: '.gitignore',
        content: generateGitignore(),
        language: 'text',
      },
    ];
  }

  private generatePackageFiles(): GeneratedFile[] {
    return [
      {
        path: 'package.json',
        content: generatePackageJson(this.blueprint),
        language: 'json',
      },
      {
        path: '.env.example',
        content: generateEnvExample(this.blueprint),
        language: 'text',
      },
    ];
  }

  private generateDatabaseFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Migrations
    files.push({
      path: 'supabase/migrations/001_initial_schema.sql',
      content: generateDatabaseMigrations(this.dbEntities),
      language: 'sql',
    });

    // RLS Policies
    files.push({
      path: 'supabase/migrations/002_rls_policies.sql',
      content: generateRLSPolicies(this.dbEntities),
      language: 'sql',
    });

    return files;
  }

  private generateApiFiles(): GeneratedFile[] {
    return this.apiEndpoints.map(endpoint => {
      const { path, content } = generateApiRouteFile(endpoint);
      return {
        path,
        content,
        language: 'typescript',
      };
    });
  }

  private generateComponentFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Home page
    files.push({
      path: 'app/page.tsx',
      content: generatePageComponent(
        'home',
        'Welcome to ' + this.blueprint.projectName,
        false
      ),
      language: 'tsx',
    });

    // Vibe DevTools (Click-to-fix)
    files.push({
      path: 'components/VibeDevTools.tsx',
      content: this.generateDevToolsComponent(),
      language: 'tsx',
    });

    // Dashboard page (if protected)
    if (this.features.hasAuth) {
      files.push({
        path: 'app/dashboard/page.tsx',
        content: generatePageComponent(
          'dashboard',
          'Your dashboard',
          true
        ),
        language: 'tsx',
      });
    }

    // Always generate root layout
    files.push({
      path: 'app/layout.tsx',
      content: this.generateRootLayout(),
      language: 'tsx',
    });

    return files;
  }

  private generateDevToolsComponent(): string {
    return \`'use client';

import { useEffect, useState } from 'react';

export function VibeDevTools() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Listen for activation messages from VibeCode Mentor
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'object' && event.data?.type === 'VIBE_TOGGLE_INSPECTOR') {
        setActive(event.data.active);
      }
    };

    window.addEventListener('message', handleMessage);

    const handleClick = (e: MouseEvent) => {
      if (!active) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      
      // Calculate selector
      const tag = target.tagName.toLowerCase();
      const id = target.id ? \`#\${target.id}\` : '';
      const classes = target.className && typeof target.className === 'string' 
        ? '.' + target.className.split(' ').filter(Boolean).join('.') 
        : '';
        
      // Send to parent
      window.parent.postMessage({
        type: 'VIBE_ELEMENT_CLICKED',
        payload: {
          tagName: tag,
          id: target.id,
          className: target.className,
          // Simplify content for context
          innerHTML: target.innerHTML.substring(0, 200),
          textContent: (target.textContent || '').substring(0, 100),
          selector: \`\${tag}\${id}\${classes}\`
        }
      }, '*');

      // Visual feedback
      const originalOutline = target.style.outline;
      target.style.outline = '2px solid #a855f7'; // Purple
      
      setTimeout(() => {
        target.style.outline = originalOutline;
      }, 500);
    };

    if (active) {
      document.addEventListener('click', handleClick, true); // Capture phase
      document.body.style.cursor = 'crosshair';
    } else {
      document.removeEventListener('click', handleClick, true);
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('click', handleClick, true);
      document.body.style.cursor = '';
    };
  }, [active]);

  return null;
}
\`;
  }

  private generateDocumentation(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    files.push({
      path: 'README.md',
      content: this.generateReadme(),
      language: 'markdown',
    });

    files.push({
      path: 'SETUP.md',
      content: this.generateSetupGuide(),
      language: 'markdown',
    });

    files.push({
      path: 'API.md',
      content: this.generateApiDocs(),
      language: 'markdown',
    });

    return files;
  }

  private generateLibFiles(): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Supabase client
    files.push({
      path: 'lib/supabase.ts',
      content: this.generateSupabaseClient(),
      language: 'typescript',
    });

    if (this.features.hasAuth) {
      files.push({
        path: 'lib/auth.ts',
        content: this.generateAuthConfig(),
        language: 'typescript',
      });
    }

    return files;
  }

  private generateSupabaseClient(): string {
    return \`import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations
export const supabaseServer = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
\`;
  }

  private generateAuthConfig(): string {
    return \`import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseServer } from './supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // TODO: Implement your authentication logic
          // Example: verify credentials against database
          return {
            id: '1',
            email: credentials.email,
            name: credentials.email,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
\`;
  }

  private generateRootLayout(): string {
    return \`import type { Metadata } from 'next';
import { VibeDevTools } from '@/components/VibeDevTools';
import './globals.css';

export const metadata: Metadata = {
  title: '\${this.blueprint.projectName}',
  description: '\${this.blueprint.description}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <VibeDevTools />
        {children}
      </body>
    </html>
  );
}
\`;
  }

  private generateReadme(): string {
    return \`# \${this.blueprint.projectName}

\${this.blueprint.description}

## Features

\${this.blueprint.features.map(f => \`- \${f}\`).join('\\n')}

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account
- GitHub account (for deployment)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd \${this.projectSlug}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your environment variables in \`.env.local\`

5. Set up the database:
\`\`\`bash
npx supabase db pull
npx supabase migration up
\`\`\`

6. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/              # Next.js app directory
├── components/       # Reusable React components
├── lib/              # Utility functions and configurations
├── supabase/         # Database migrations and policies
├── public/           # Static assets
└── types/            # TypeScript type definitions
\`\`\`

## Database Schema

\${this.generateSchemaDocumentation()}

## API Endpoints

See [API.md](./API.md) for detailed API documentation.

## Deployment

This project is configured for Vercel deployment.

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

## License

MIT
\`;
  }

  private generateSetupGuide(): string {
    return \`# Setup Guide

## Prerequisites

- Node.js 18+
- Supabase account
- Git

## Step 1: Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd \${this.projectSlug}
\`\`\`

## Step 2: Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Step 3: Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Copy your project URL and anon key
4. Create \`.env.local\` file (copy from .env.example)
5. Add your Supabase credentials

## Step 4: Database Setup

\`\`\`bash
npx supabase db push
\`\`\`

## Step 5: Run Locally

\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

## Step 6: Deploy to Vercel

1. Push to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy

## Troubleshooting

### Port 3000 already in use

\`\`\`bash
npm run dev -- -p 3001
\`\`\`

### Database connection issues

Check that:
- Your Supabase URL is correct
- Your anon key is valid
- Your .env.local file has the right variables
\`;
  }

  private generateApiDocs(): string {
    let docs = \`# API Documentation\\n\\n\`;
    docs += \`## Base URL\\n\\n\\\`/api\\\`\\n\\n\`;

    docs += '## Endpoints\\n\\n';

    this.apiEndpoints.forEach(endpoint => {
      docs += \`### \${endpoint.method} \${endpoint.path}\\n\`;
      docs += \`\${endpoint.description}\\n\\n\`;
      if (endpoint.requiresAuth) {
        docs += '**Authentication**: Required\\n\\n';
      }
      docs += '---\\n\\n';
    });

    return docs;
  }

  private generateSchemaDocumentation(): string {
    let docs = '```\\n';
    this.dbEntities.forEach(entity => {
      docs += \`\${entity.name}\\n\`;
      entity.fields.forEach(field => {
        docs += \`  - \${field.name}: \${field.type}\${field.required ? ' (required)' : ''}\\n\`;
      });
      docs += '\\n';
    });
    docs += '```';
      return docs;
    }

  private getTechnologies(): string[] {
      const tech = [
        'Next.js 14',
        'React 18',
        'TypeScript',
        'Tailwind CSS',
        'Supabase',
      ];

      if(this.features.hasAuth) tech.push('NextAuth.js');
    if (this.features.hasPayments) tech.push('Stripe');
    if (this.features.hasEmail) tech.push('Resend');
    if (this.features.hasFileUpload) tech.push('Cloudinary');

    return tech;
  }

  private estimateComponentCount(): number {
    return this.apiEndpoints.length * 2 + 5;
  }
}
