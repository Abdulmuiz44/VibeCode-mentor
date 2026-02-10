import { SavedBlueprint } from '@/types/blueprint';

export interface Blueprint {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  components: Component[];
  features: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

export interface Component {
  id: string;
  name: string;
  type: 'component' | 'page' | 'api' | 'util';
  description: string;
  files: FileReference[];
}

export interface FileReference {
  path: string;
  name: string;
  type: string;
  description: string;
}

// Mock blueprint data - in production, this would come from database
const mockBlueprints: Blueprint[] = [
  {
    id: 'todo-app',
    title: 'Todo Application',
    description: 'A modern todo application with drag-and-drop functionality',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    components: [
      {
        id: '1',
        name: 'TodoList',
        type: 'component',
        description: 'Main todo list component with drag and drop',
        files: [
          { path: '/src/components/TodoList.tsx', name: 'TodoList.tsx', type: 'tsx', description: 'Todo list component' }
        ]
      },
      {
        id: '2',
        name: 'TodoItem',
        type: 'component',
        description: 'Individual todo item component',
        files: [
          { path: '/src/components/TodoItem.tsx', name: 'TodoItem.tsx', type: 'tsx', description: 'Todo item component' }
        ]
      }
    ],
    features: ['Drag and Drop', 'Local Storage', 'Filtering', 'Categories'],
    difficulty: 'beginner',
    estimatedTime: '2-3 hours'
  },
  {
    id: 'blog-platform',
    title: 'Blog Platform',
    description: 'A full-featured blog platform with markdown support',
    techStack: ['Next.js', 'TypeScript', 'MDX', 'Prisma', 'PostgreSQL'],
    components: [
      {
        id: '1',
        name: 'BlogPost',
        type: 'page',
        description: 'Blog post page with markdown rendering',
        files: [
          { path: '/app/blog/[slug]/page.tsx', name: 'page.tsx', type: 'tsx', description: 'Blog post page' }
        ]
      },
      {
        id: '2',
        name: 'BlogList',
        type: 'page',
        description: 'Blog listing page with pagination',
        files: [
          { path: '/app/blog/page.tsx', name: 'page.tsx', type: 'tsx', description: 'Blog listing page' }
        ]
      }
    ],
    features: ['Markdown Support', 'SEO Optimization', 'Comments', 'Categories'],
    difficulty: 'intermediate',
    estimatedTime: '4-6 hours'
  },
  {
    id: 'ecommerce-store',
    title: 'E-commerce Store',
    description: 'A complete e-commerce platform with payment integration',
    techStack: ['Next.js', 'TypeScript', 'Stripe', 'Prisma', 'PostgreSQL'],
    components: [
      {
        id: '1',
        name: 'ProductList',
        type: 'page',
        description: 'Product listing page with filters',
        files: [
          { path: '/app/products/page.tsx', name: 'page.tsx', type: 'tsx', description: 'Product listing page' }
        ]
      },
      {
        id: '2',
        name: 'ProductDetail',
        type: 'page',
        description: 'Individual product page with add to cart',
        files: [
          { path: '/app/products/[id]/page.tsx', name: 'page.tsx', type: 'tsx', description: 'Product detail page' }
        ]
      },
      {
        id: '3',
        name: 'ShoppingCart',
        type: 'component',
        description: 'Shopping cart component',
        files: [
          { path: '/src/components/ShoppingCart.tsx', name: 'ShoppingCart.tsx', type: 'tsx', description: 'Shopping cart component' }
        ]
      }
    ],
    features: ['Payment Integration', 'Inventory Management', 'User Accounts', 'Order Tracking'],
    difficulty: 'advanced',
    estimatedTime: '8-12 hours'
  }
];

export function getBlueprintById(id: string): Blueprint | null {
  return mockBlueprints.find(blueprint => blueprint.id === id) || null;
}

export function getAllBlueprints(): Blueprint[] {
  return mockBlueprints;
}

export function getBlueprintsByDifficulty(difficulty: Blueprint['difficulty']): Blueprint[] {
  return mockBlueprints.filter(blueprint => blueprint.difficulty === difficulty);
}

export function getBlueprintsByTechStack(techStack: string[]): Blueprint[] {
  return mockBlueprints.filter(blueprint => 
    blueprint.techStack.some(tech => techStack.includes(tech))
  );
}

// Helper function to generate initial files from blueprint
export function generateFilesFromBlueprint(blueprint: Blueprint): any[] {
  const files: any[] = [];
  
  // Generate package.json
  files.push({
    id: 'package.json',
    name: 'package.json',
    type: 'file',
    content: JSON.stringify({
      name: blueprint.title.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: blueprint.description,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: generateDependencies(blueprint.techStack),
      devDependencies: {
        '@types/node': '^20',
        '@types/react': '^18',
        '@types/react-dom': '^18',
        'typescript': '^5'
      }
    }, null, 2),
    path: '/package.json'
  });

  // Generate basic app structure
  files.push({
    id: 'app-layout',
    name: 'layout.tsx',
    type: 'file',
    content: generateLayoutFile(blueprint),
    path: '/app/layout.tsx'
  });

  files.push({
    id: 'app-page',
    name: 'page.tsx',
    type: 'file',
    content: generateMainPage(blueprint),
    path: '/app/page.tsx'
  });

  // Generate component files based on blueprint components
  blueprint.components.forEach(component => {
    component.files.forEach(file => {
      files.push({
        id: `${component.id}-${file.name}`,
        name: file.name,
        type: 'file',
        content: generateComponentFile(component, blueprint),
        path: file.path
      });
    });
  });

  return files;
}

function generateDependencies(techStack: string[]): Record<string, string> {
  const deps: Record<string, string> = {
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
    'next': '^14.0.0'
  };

  if (techStack.includes('TypeScript')) {
    deps['typescript'] = '^5.0.0';
  }

  if (techStack.includes('Tailwind CSS')) {
    deps['tailwindcss'] = '^3.3.0';
    deps['autoprefixer'] = '^10.4.0';
    deps['postcss'] = '^8.4.0';
  }

  if (techStack.includes('Prisma')) {
    deps['@prisma/client'] = '^5.0.0';
    deps['prisma'] = '^5.0.0';
  }

  if (techStack.includes('PostgreSQL')) {
    deps['pg'] = '^8.8.0';
  }

  if (techStack.includes('Stripe')) {
    deps['stripe'] = '^14.0.0';
  }

  return deps;
}

function generateLayoutFile(blueprint: Blueprint): string {
  return `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '${blueprint.title}',
  description: '${blueprint.description}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}`;
}

function generateMainPage(blueprint: Blueprint): string {
  return `export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ${blueprint.title}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            ${blueprint.description}
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <p className="text-gray-600 mb-6">
              This is your ${blueprint.title.toLowerCase()} project. 
              Start building your features using the AI assistant on the left.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              ${blueprint.features.map(feature => `
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>${feature}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}`;
}

function generateComponentFile(component: any, blueprint: Blueprint): string {
  const baseContent = `export default function ${component.name}() {
  return (
    <div className="${component.type === 'page' ? 'min-h-screen bg-gray-50' : 'bg-white rounded-lg shadow p-6'}">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          ${component.name}
        </h1>
        <p className="text-gray-600 mb-8">
          ${component.description}
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800">
            This ${component.type.toLowerCase()} is part of your ${blueprint.title.toLowerCase()} project.
            Use the AI assistant to customize and extend this functionality.
          </p>
        </div>
      </div>
    </div>
  );
}`;

  return baseContent;
}
