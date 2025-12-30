import { ApiEndpoint } from '../types';
import { BlueprintParser } from '../blueprint-parser';

export function generateApiRoute(endpoint: ApiEndpoint): string {
  const { method, path, description, requiresAuth } = endpoint;
  const routeParts = path
    .split('/')
    .filter(p => p && !p.startsWith(':'))
    .map(p => BlueprintParser.slugify(p));

  const fileName = routeParts[routeParts.length - 1] || 'index';
  const isParamRoute = path.includes(':');

  const authCheck = requiresAuth
    ? `
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
`
    : '';

  const methodName = method.toLowerCase();
  const functionName = `handle${method}`;

  const template = `import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * @api {${method}} ${path}
 * @description ${description}
 */
export async function ${method}(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
${authCheck}
    // TODO: Implement ${method} ${path}
    // Replace this with your actual business logic

    return NextResponse.json(
      { message: 'TODO: Implement this endpoint' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

  return template;
}

export function generateApiRouteFile(endpoint: ApiEndpoint): { path: string; content: string } {
  const routeParts = endpoint.path
    .split('/')
    .filter(p => p)
    .map((p, i) => {
      if (p.startsWith(':')) {
        return `[${p.slice(1)}]`;
      }
      return BlueprintParser.slugify(p);
    });

  const filePath = `app/api/${routeParts.join('/')}/route.ts`;

  return {
    path: filePath,
    content: generateApiRoute(endpoint),
  };
}
