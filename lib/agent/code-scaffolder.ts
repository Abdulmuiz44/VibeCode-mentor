/**
 * Phase 2: Code Scaffolding
 * Converts blueprint into actual codebase structure and files
 */

import { GeneratedBlueprint } from './blueprint-generator';

export interface FileTree {
  [key: string]: string | FileTree;
}

export class CodeScaffolder {
  /**
   * Generate complete project codebase from blueprint
   */
  async scaffold(blueprint: GeneratedBlueprint, projectName: string): Promise<FileTree> {
    const fileTree: FileTree = {
      // Package configuration
      'package.json': this.generatePackageJson(blueprint, projectName),
      'package-lock.json': '{}',
      'tsconfig.json': this.generateTsConfig(),
      '.gitignore': this.generateGitignore(),
      'README.md': this.generateReadme(blueprint, projectName),
      
      // Next.js structure
      'next.config.mjs': this.generateNextConfig(),
      'postcss.config.mjs': this.generatePostcssConfig(),
      'tailwind.config.ts': this.generateTailwindConfig(),
      
      // App directory
      app: {
        'layout.tsx': this.generateRootLayout(),
        'page.tsx': this.generateHomePage(),
        'globals.css': this.generateGlobalStyles(),
        api: {
          'route.ts': this.generateApiRoute()
        }
      },
      
      // Components
      components: {
        'Header.tsx': this.generateHeader(),
        'Footer.tsx': this.generateFooter()
      },
      
      // Lib/Utils
      lib: {
        'api.ts': this.generateApiClient()
      },
      
      // Types
      types: {
        'index.ts': this.generateTypes(blueprint)
      },
      
      // Docker
      'Dockerfile': this.generateDockerfile(),
      '.dockerignore': this.generateDockerigore()
    };

    // Generate API endpoints based on blueprint
    if (blueprint.api.endpoints.length > 0) {
      (fileTree.app as any).api = {
        ...((fileTree.app as any).api || {}),
        ...this.generateApiEndpoints(blueprint)
      };
    }

    // Generate pages based on blueprint
    if (blueprint.ui.pages.length > 0) {
      for (const page of blueprint.ui.pages) {
        if (page.route !== '/') {
          const routeParts = page.route.split('/').filter(Boolean);
          let current: any = fileTree.app;
          
          for (let i = 0; i < routeParts.length; i++) {
            const part = routeParts[i];
            const isLast = i === routeParts.length - 1;
            
            if (!current[part]) {
              current[part] = {};
            }
            
            if (isLast) {
              current[part]['page.tsx'] = this.generatePageComponent(page);
            }
            
            current = current[part];
          }
        }
      }
    }

    return fileTree;
  }

  private generatePackageJson(blueprint: GeneratedBlueprint, projectName: string): string {
    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        test: 'jest',
        'test:watch': 'jest --watch'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        next: '^15.0.0',
        typescript: '^5.0.0',
        ...this.getAdditionalDependencies(blueprint)
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.0.0',
        '@types/jest': '^29.0.0',
        jest: '^29.0.0',
        'jest-environment-jsdom': '^29.0.0',
        '@testing-library/react': '^14.0.0',
        '@testing-library/jest-dom': '^6.0.0'
      }
    }, null, 2);
  }

  private getAdditionalDependencies(blueprint: GeneratedBlueprint): Record<string, string> {
    const deps: Record<string, string> = {};
    
    if (blueprint.techStack.frontend.includes('Tailwind CSS')) {
      deps['tailwindcss'] = '^3.0.0';
      deps['postcss'] = '^8.0.0';
      deps['autoprefixer'] = '^10.0.0';
    }
    
    if (blueprint.database.type === 'postgresql') {
      deps['pg'] = '^8.0.0';
    }

    return deps;
  }

  private generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noImplicitAny: true,
        noEmit: true,
        moduleResolution: 'bundler',
        paths: {
          '@/*': ['./*']
        }
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules', '.next', 'dist']
    }, null, 2);
  }

  private generateGitignore(): string {
    return `node_modules/
.next/
dist/
build/
.env.local
.env.*.local
.DS_Store
*.log
*.swp
.vscode/
.idea/
`;
  }

  private generateReadme(blueprint: GeneratedBlueprint, projectName: string): string {
    return `# ${projectName}

${blueprint.description}

## Tech Stack
- Frontend: ${blueprint.techStack.frontend.join(', ')}
- Backend: ${blueprint.techStack.backend.join(', ')}
- Database: ${blueprint.techStack.database.join(', ')}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture
${blueprint.architecture.pattern.toUpperCase()}

## Development Timeline
${blueprint.timeline.map(t => `- ${t.phase}: ${t.duration} hours`).join('\n')}
`;
  }

  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;`;
  }

  private generatePostcssConfig(): string {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;
  }

  private generateTailwindConfig(): string {
    return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config`;
  }

  private generateRootLayout(): string {
    return `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Application",
  description: "Generated with VibeCode Mentor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
  }

  private generateHomePage(): string {
    return `export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Your Application
        </h1>
        <p className="text-gray-400">Generated with VibeCode Mentor</p>
      </div>
    </main>
  );
}`;
  }

  private generateGlobalStyles(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}`;
  }

  private generateApiRoute(): string {
    return `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'API is working' });
}`;
  }

  private generateApiEndpoints(blueprint: GeneratedBlueprint): Record<string, string> {
    const endpoints: Record<string, string> = {};
    
    for (const endpoint of blueprint.api.endpoints) {
      const parts = endpoint.path.split('/').filter(Boolean);
      const filename = parts.length > 0 ? `[${parts[0]}]/route.ts` : 'route.ts';
      
      endpoints[filename] = `import { NextResponse } from 'next/server';

export async function ${endpoint.method}() {
  // TODO: Implement ${endpoint.method} ${endpoint.path}
  // ${endpoint.description}
  return NextResponse.json({ message: 'Endpoint not implemented' });
}`;
    }
    
    return endpoints;
  }

  private generatePageComponent(page: any): string {
    return `export default function ${this.pascalCase(page.name)}() {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold">${page.name}</h1>
      <p className="text-gray-600">${page.purpose}</p>
    </div>
  );
}`;
  }

  private generateHeader(): string {
    return `export default function Header() {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-bold">App Name</h1>
      </nav>
    </header>
  );
}`;
  }

  private generateFooter(): string {
    return `export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
}`;
  }

  private generateApiClient(): string {
    return `const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(\`\${API_URL}\${endpoint}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(\`API error: \${response.status}\`);
  }

  return response.json();
}`;
  }

  private generateTypes(blueprint: GeneratedBlueprint): string {
    return `${blueprint.database.tables.map(table => {
      return `export interface ${this.pascalCase(table.name)} {
  ${table.fields.map(f => `${f.name}: ${this.tsType(f.type)};`).join('\n  ')}
}`;
    }).join('\n\n')}`;
  }

  private generateDockerfile(): string {
    return `FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]`;
  }

  private generateDockerigore(): string {
    return `.next
node_modules
.git
.env
.env.*
`;
  }

  private pascalCase(str: string): string {
    return str
      .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
      .replace(/^./, c => c.toUpperCase());
  }

  private tsType(dbType: string): string {
    const map: Record<string, string> = {
      'UUID': 'string',
      'TEXT': 'string',
      'TIMESTAMP': 'Date',
      'INTEGER': 'number',
      'BOOLEAN': 'boolean',
      'JSON': 'Record<string, any>'
    };
    return map[dbType] || 'any';
  }
}
