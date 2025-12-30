export function generatePageComponent(
  name: string,
  description: string,
  isProtected: boolean = false
): string {
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1);

  return `'use client';

import { useEffect, useState } from 'react';
${isProtected ? "import { useSession } from 'next-auth/react';" : ''}
${isProtected ? "import { useRouter } from 'next/navigation';" : ''}

/**
 * ${pascalName} Page
 * ${description}
 */
export default function ${pascalName}Page() {
${
  isProtected
    ? `  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [session, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }
`
    : '  const [isLoading, setIsLoading] = useState(false);'
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            ${pascalName}
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            ${description}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">
          <p className="text-gray-400">
            TODO: Add your ${name} content here
          </p>
        </div>
      </div>
    </div>
  );
}
`;
}

export function generateListComponent(name: string, fields: string[]): string {
  const singularName = name.slice(0, -1);
  const pascalName = singularName.charAt(0).toUpperCase() + singularName.slice(1);

  return `'use client';

import { useEffect, useState } from 'react';

interface ${pascalName} {
  id: string;
${fields.map(f => `  ${f}: string;`).join('\n')}
  created_at: string;
}

export default function ${name}List() {
  const [items, setItems] = useState<${pascalName}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/${name}');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching items');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">${name}</h2>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
          Add New
        </button>
      </div>

      <div className="grid gap-4">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors"
          >
            <div className="text-white font-semibold">{item.id}</div>
            <div className="text-gray-400 text-sm">Created {new Date(item.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items yet
        </div>
      )}
    </div>
  );
}
`;
}
