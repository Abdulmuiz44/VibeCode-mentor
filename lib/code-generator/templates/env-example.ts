import { Blueprint } from '../types';
import { BlueprintParser } from '../blueprint-parser';

export function generateEnvExample(blueprint: Blueprint): string {
  const features = BlueprintParser.extractFeatures(blueprint);

  const envVars = [
    '# Supabase Configuration',
    'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key',
    'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key',
    '',
  ];

  if (features.hasAuth) {
    envVars.push('# NextAuth Configuration');
    envVars.push('NEXTAUTH_SECRET=your-secret-key');
    envVars.push('NEXTAUTH_URL=http://localhost:3000');
    envVars.push('');
  }

  if (features.hasPayments) {
    envVars.push('# Stripe Configuration');
    envVars.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
    envVars.push('STRIPE_SECRET_KEY=sk_test_...');
    envVars.push('STRIPE_WEBHOOK_SECRET=whsec_...');
    envVars.push('');
  }

  if (features.hasEmail) {
    envVars.push('# Email Configuration (Resend)');
    envVars.push('RESEND_API_KEY=re_...');
    envVars.push('');
  }

  if (features.hasFileUpload) {
    envVars.push('# File Upload Configuration (Cloudinary)');
    envVars.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name');
    envVars.push('CLOUDINARY_API_KEY=your-api-key');
    envVars.push('CLOUDINARY_API_SECRET=your-api-secret');
    envVars.push('');
  }

  if (features.hasSearch) {
    envVars.push('# Meilisearch Configuration');
    envVars.push('MEILISEARCH_HOST=http://localhost:7700');
    envVars.push('MEILISEARCH_API_KEY=your-api-key');
    envVars.push('');
  }

  envVars.push('# Application Settings');
  envVars.push('NODE_ENV=development');
  envVars.push('NEXT_PUBLIC_APP_URL=http://localhost:3000');

  return envVars.join('\n');
}
