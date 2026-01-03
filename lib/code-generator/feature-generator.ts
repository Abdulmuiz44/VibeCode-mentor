import { BlueprintV2, GeneratedFile } from './types';

export class FeatureGenerator {
  static async generateAuthFeature(
    blueprint: BlueprintV2,
    authProvider: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    if (authProvider === 'supabase') {
      files.push({
        path: 'lib/auth/supabase-client.ts',
        content: this.generateSupabaseAuthClient(),
        language: 'typescript',
      });

      files.push({
        path: 'app/auth/login/page.tsx',
        content: this.generateLoginPage(),
        language: 'tsx',
      });

      files.push({
        path: 'app/auth/register/page.tsx',
        content: this.generateRegisterPage(),
        language: 'tsx',
      });

      files.push({
        path: 'lib/auth/protected-route.tsx',
        content: this.generateProtectedRoute(),
        language: 'tsx',
      });
    }

    return files;
  }

  static async generateDatabaseFeature(
    blueprint: BlueprintV2,
    dbProvider: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    if (dbProvider === 'postgres') {
      files.push({
        path: 'prisma/schema.prisma',
        content: this.generatePrismaSchema(blueprint),
        language: 'text',
      });

      files.push({
        path: 'lib/db/client.ts',
        content: this.generatePrismaClient(),
        language: 'typescript',
      });

      files.push({
        path: 'supabase/migrations/001_initial_schema.sql',
        content: this.generateInitialSchema(blueprint),
        language: 'sql',
      });
    }

    return files;
  }

  static async generatePaymentsFeature(
    blueprint: BlueprintV2,
    paymentProvider: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    if (paymentProvider === 'stripe') {
      files.push({
        path: 'lib/stripe/client.ts',
        content: this.generateStripeClient(),
        language: 'typescript',
      });

      files.push({
        path: 'app/api/stripe/checkout/route.ts',
        content: this.generateStripeCheckout(),
        language: 'typescript',
      });

      files.push({
        path: 'app/api/stripe/webhook/route.ts',
        content: this.generateStripeWebhook(),
        language: 'typescript',
      });
    } else if (paymentProvider === 'lemonsqueezy') {
      files.push({
        path: 'lib/payments/lemonsqueezy.ts',
        content: this.generateLemonSqueezyClient(),
        language: 'typescript',
      });

      files.push({
        path: 'app/api/payments/checkout/route.ts',
        content: this.generateLemonSqueezyCheckout(),
        language: 'typescript',
      });
    }

    return files;
  }

  static async generateAPIFeature(
    blueprint: BlueprintV2
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Parse API endpoints from blueprint.apiEndpoints
    files.push({
      path: 'lib/api/types.ts',
      content: this.generateAPITypes(),
      language: 'typescript',
    });

    files.push({
      path: 'lib/api/handlers.ts',
      content: this.generateAPIHandlers(),
      language: 'typescript',
    });

    return files;
  }

  // Template generators
  private static generateSupabaseAuthClient(): string {
    return `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role
export const supabaseServer = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}
`;
  }

  private static generateLoginPage(): string {
    return `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth/supabase-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-3xl font-bold">Sign In</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
`;
  }

  private static generateRegisterPage(): string {
    return `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth/supabase-client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUp(email, password);
      router.push('/auth/login?message=Check+your+email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-3xl font-bold">Create Account</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
`;
  }

  private static generateProtectedRoute(): string {
    return `'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
`;
  }

  private static generatePrismaSchema(blueprint: BlueprintV2): string {
    return `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    String     @id @default(cuid())
  email String     @unique
  name  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
  }

  private static generatePrismaClient(): string {
    return `import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;
  }

  private static generateInitialSchema(blueprint: BlueprintV2): string {
    return `-- Initial schema from blueprint: ${blueprint.projectName}
-- Database provider: PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "User" (
  id TEXT NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
  }

  private static generateStripeClient(): string {
    return `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default stripe;

export async function createCheckoutSession(params: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer: params.customerId,
  });

  return session;
}
`;
  }

  private static generateStripeCheckout(): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: \`\${process.env.NEXT_PUBLIC_URL}/success\`,
      cancel_url: \`\${process.env.NEXT_PUBLIC_URL}/cancel\`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
`;
  }

  private static generateStripeWebhook(): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Handle subscription event
        break;
      case 'customer.subscription.deleted':
        // Handle cancellation
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
}
`;
  }

  private static generateLemonSqueezyClient(): string {
    return `const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

export async function createCheckout(productId: string, variantId: string) {
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${LEMONSQUEEZY_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          product_id: productId,
          variant_id: variantId,
          redirect_url: \`\${process.env.NEXT_PUBLIC_URL}/success\`,
        },
      },
    }),
  });

  return response.json();
}
`;
  }

  private static generateLemonSqueezyCheckout(): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@/lib/payments/lemonsqueezy';

export async function POST(request: NextRequest) {
  try {
    const { productId, variantId } = await request.json();

    if (!productId || !variantId) {
      return NextResponse.json(
        { error: 'Missing productId or variantId' },
        { status: 400 }
      );
    }

    const checkout = await createCheckout(productId, variantId);
    return NextResponse.json(checkout);
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
`;
  }

  private static generateAPITypes(): string {
    return `export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
`;
  }

  private static generateAPIHandlers(): string {
    return `import { NextRequest, NextResponse } from 'next/server';

export function createApiResponse<T>(
  data: T,
  status: number = 200
) {
  return NextResponse.json(
    { success: true, data, status },
    { status }
  );
}

export function createErrorResponse(
  error: string,
  status: number = 500
) {
  return NextResponse.json(
    { success: false, error, status },
    { status }
  );
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(total / pageSize);
  return NextResponse.json({
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages,
    },
  });
}
`;
  }
}
