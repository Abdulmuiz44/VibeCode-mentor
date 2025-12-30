import { Blueprint } from '../types';
import { BlueprintParser } from '../blueprint-parser';

export function generatePackageJson(blueprint: Blueprint): string {
  const features = BlueprintParser.extractFeatures(blueprint);
  const slug = BlueprintParser.slugify(blueprint.projectName);

  const dependencies: Record<string, string> = {
    'next': '^14.2.5',
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    '@supabase/supabase-js': '^2.81.1',
    '@supabase/auth-helpers-nextjs': '^0.10.0',
    'typescript': '^5.5.3',
    'tailwindcss': '^3.4.4',
    'autoprefixer': '^10.4.19',
    'postcss': '^8.4.39',
  };

  if (features.hasAuth) {
    dependencies['next-auth'] = '^4.24.13';
    dependencies['bcryptjs'] = '^3.0.3';
  }

  if (features.hasPayments) {
    dependencies['stripe'] = '^14.0.0';
  }

  if (features.hasEmail) {
    dependencies['resend'] = '^6.4.2';
    dependencies['react-email'] = '^5.0.4';
  }

  if (features.hasFileUpload) {
    dependencies['next-cloudinary'] = '^5.0.0';
  }

  if (features.hasRealtime) {
    dependencies['swr'] = '^2.2.0';
  }

  if (features.hasSearch) {
    dependencies['meilisearch'] = '^0.33.0';
  }

  const devDependencies: Record<string, string> = {
    '@types/node': '^20.14.10',
    '@types/react': '^18.3.3',
    '@types/react-dom': '^18.3.0',
    'eslint': '^8.57.0',
    'eslint-config-next': '^14.2.5',
  };

  if (features.hasAuth) {
    devDependencies['@types/bcryptjs'] = '^3.0.0';
  }

  const packageJson = {
    name: slug,
    version: '0.1.0',
    private: true,
    description: blueprint.description,
    scripts: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start',
      'lint': 'next lint',
      'type-check': 'tsc --noEmit',
    },
    dependencies,
    devDependencies,
  };

  return JSON.stringify(packageJson, null, 2);
}
