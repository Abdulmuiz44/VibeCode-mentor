import { BlueprintV2 } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class BlueprintValidator {
  static validate(blueprint: BlueprintV2): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!blueprint.projectName?.trim()) {
      errors.push({
        field: 'projectName',
        message: 'Project name is required and must not be empty',
      });
    }

    if (!blueprint.description?.trim()) {
      errors.push({
        field: 'description',
        message: 'Description is required',
      });
    }

    // Validate features array
    if (!blueprint.features || !Array.isArray(blueprint.features)) {
      errors.push({
        field: 'features',
        message: 'Features must be an array',
      });
    } else if (blueprint.features.length === 0) {
      errors.push({
        field: 'features',
        message: 'At least one feature is required',
      });
    }

    // Validate database schema
    if (!blueprint.databaseSchema?.trim()) {
      errors.push({
        field: 'databaseSchema',
        message: 'Database schema is required',
      });
    }

    // Validate API endpoints
    if (!blueprint.apiEndpoints?.trim()) {
      errors.push({
        field: 'apiEndpoints',
        message: 'API endpoints definition is required',
      });
    }

    // Validate UI components
    if (!blueprint.uiComponents?.trim()) {
      errors.push({
        field: 'uiComponents',
        message: 'UI components definition is required',
      });
    }

    // Validate tags if present
    if (blueprint.tags) {
      this.validateTags(blueprint.tags, errors);
    }

    // Validate build config if present
    if (blueprint.buildConfig) {
      this.validateBuildConfig(blueprint.buildConfig, errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static validateTags(
    tags: BlueprintV2['tags'],
    errors: ValidationError[]
  ): void {
    if (!tags) return;

    const supportedFrameworks = ['nextjs', 'react', 'nuxt', 'vue'];
    const supportedDatabases = ['postgres', 'mongodb', 'mysql'];
    const supportedAuth = ['supabase', 'auth0', 'next-auth'];
    const supportedUI = ['tailwind', 'shadcn', 'material-ui'];
    const supportedPayments = ['stripe', 'lemonsqueezy'];
    const supportedDeployment = ['vercel', 'netlify', 'aws'];

    if (tags?.framework && !supportedFrameworks.includes(tags.framework)) {
      errors.push({
        field: 'tags.framework',
        message: `Unsupported framework: ${tags.framework}. Supported: ${supportedFrameworks.join(', ')}`,
      });
    }

    if (tags?.database && !supportedDatabases.includes(tags.database)) {
      errors.push({
        field: 'tags.database',
        message: `Unsupported database: ${tags.database}. Supported: ${supportedDatabases.join(', ')}`,
      });
    }

    if (tags?.auth && !supportedAuth.includes(tags.auth)) {
      errors.push({
        field: 'tags.auth',
        message: `Unsupported auth: ${tags.auth}. Supported: ${supportedAuth.join(', ')}`,
      });
    }

    if (tags?.ui && !supportedUI.includes(tags.ui)) {
      errors.push({
        field: 'tags.ui',
        message: `Unsupported UI framework: ${tags.ui}. Supported: ${supportedUI.join(', ')}`,
      });
    }

    if (tags?.payments && !supportedPayments.includes(tags.payments)) {
      errors.push({
        field: 'tags.payments',
        message: `Unsupported payments: ${tags.payments}. Supported: ${supportedPayments.join(', ')}`,
      });
    }

    if (tags?.deployment && !supportedDeployment.includes(tags.deployment)) {
      errors.push({
        field: 'tags.deployment',
        message: `Unsupported deployment: ${tags.deployment}. Supported: ${supportedDeployment.join(', ')}`,
      });
    }

    // Stack compatibility checks
    if (tags?.framework === 'nextjs' && tags?.database === 'mongodb') {
      // Both work fine, no issue
    }

    if (tags?.database === 'postgres' && !tags?.auth) {
      errors.push({
        field: 'tags.auth',
        message: 'PostgreSQL requires an auth provider. Please specify tags.auth',
      });
    }
  }

  private static validateBuildConfig(
    config: BlueprintV2['buildConfig'],
    errors: ValidationError[]
  ): void {
    if (!config) return;

    const validLinting = ['eslint', 'eslint-strict'];
    const validFormatting = ['prettier'];
    const validTypeChecking = ['strict', 'standard'];
    const validTesting = ['jest', 'vitest', 'none'];

    if (config?.linting && !validLinting.includes(config.linting)) {
      errors.push({
        field: 'buildConfig.linting',
        message: `Invalid linting: ${config.linting}. Supported: ${validLinting.join(', ')}`,
      });
    }

    if (config?.formatting && !validFormatting.includes(config.formatting)) {
      errors.push({
        field: 'buildConfig.formatting',
        message: `Invalid formatting: ${config.formatting}. Supported: ${validFormatting.join(', ')}`,
      });
    }

    if (config?.typeChecking && !validTypeChecking.includes(config.typeChecking)) {
      errors.push({
        field: 'buildConfig.typeChecking',
        message: `Invalid typeChecking: ${config.typeChecking}. Supported: ${validTypeChecking.join(', ')}`,
      });
    }

    if (config?.testing && !validTesting.includes(config.testing)) {
      errors.push({
        field: 'buildConfig.testing',
        message: `Invalid testing: ${config.testing}. Supported: ${validTesting.join(', ')}`,
      });
    }
  }

  static getStackSummary(blueprint: BlueprintV2): string {
    const parts = [
      blueprint.tags?.framework || 'React',
      blueprint.tags?.database || 'PostgreSQL',
      blueprint.tags?.auth || 'NextAuth',
      blueprint.tags?.ui || 'Tailwind',
    ];
    return parts.join(' + ');
  }
}
