import {
  Blueprint,
  DatabaseEntity,
  DatabaseField,
  DatabaseRelationship,
  ApiEndpoint,
} from './types';

export class BlueprintParser {
  static parseDatabase(schemaText: string): DatabaseEntity[] {
    const entities: DatabaseEntity[] = [];
    const lines = schemaText.split('\n').filter(l => l.trim());

    let currentEntity: DatabaseEntity | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Match entity declaration: "Users (id, email, name)"
      const entityMatch = trimmed.match(/^([A-Z]\w+)\s*\((.*?)\)/);
      if (entityMatch) {
        if (currentEntity) {
          entities.push(currentEntity);
        }

        const entityName = entityMatch[1];
        const fieldsStr = entityMatch[2];
        const fields = fieldsStr
          .split(',')
          .map(f => this.parseField(f.trim()))
          .filter(f => f !== null) as DatabaseField[];

        currentEntity = {
          name: entityName,
          fields,
          relationships: [],
        };
      }

      // Match relationships: "├─ has many Projects"
      if (currentEntity && (trimmed.includes('has many') || trimmed.includes('has one'))) {
        const relMatch = trimmed.match(/has\s+(many|one)\s+(\w+)/);
        if (relMatch) {
          const relType = relMatch[1] === 'many' ? 'one-to-many' : 'one-to-one';
          const targetEntity = relMatch[2];
          currentEntity.relationships.push({
            type: relType,
            target: targetEntity,
          });
        }
      }
    }

    if (currentEntity) {
      entities.push(currentEntity);
    }

    return entities;
  }

  private static parseField(fieldStr: string): DatabaseField | null {
    // Parse "id, email, name, created_at"
    const parts = fieldStr.split(/[\s,]+/).filter(p => p);
    if (parts.length === 0) return null;

    const name = parts[0];
    const type = parts[1] || 'string';
    const isPrimary = name === 'id';

    return {
      name,
      type,
      required: !name.includes('?'),
      isPrimary,
    };
  }

  static parseApiEndpoints(endpointsText: string): ApiEndpoint[] {
    const endpoints: ApiEndpoint[] = [];
    const lines = endpointsText.split('\n').filter(l => l.trim());

    for (const line of lines) {
      // Match: "GET /api/projects - List user's projects"
      const match = line.match(
        /^(GET|POST|PUT|PATCH|DELETE)\s+(\/[\w\/:_-]*)\s*-?\s*(.*?)$/i
      );

      if (match) {
        endpoints.push({
          method: match[1].toUpperCase() as any,
          path: match[2],
          description: match[3] || '',
          requiresAuth: !line.toLowerCase().includes('public'),
        });
      }
    }

    return endpoints;
  }

  static extractFeatures(blueprint: Blueprint): {
    hasAuth: boolean;
    hasPayments: boolean;
    hasRealtime: boolean;
    hasFileUpload: boolean;
    hasEmail: boolean;
    hasSearch: boolean;
    hasAnalytics: boolean;
    hasRateLimit: boolean;
    hasCache: boolean;
    hasCDN: boolean;
  } {
    return {
      hasAuth: blueprint.features.includes('auth'),
      hasPayments: blueprint.features.includes('payments'),
      hasRealtime: blueprint.features.includes('realtime'),
      hasFileUpload: blueprint.features.includes('fileupload'),
      hasEmail: blueprint.features.includes('email'),
      hasSearch: blueprint.features.includes('search'),
      hasAnalytics: blueprint.features.includes('analytics'),
      hasRateLimit: blueprint.features.includes('ratelimit'),
      hasCache: blueprint.features.includes('cache'),
      hasCDN: blueprint.features.includes('cdn'),
    };
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static toCamelCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/-([a-z])/g, g => g[1].toUpperCase())
      .replace(/^[A-Z]/, m => m.toLowerCase());
  }

  static toPascalCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w)/g, match => match.toUpperCase())
      .replace(/-/g, '');
  }
}
