import { DatabaseEntity, DatabaseField } from '../types';
import { BlueprintParser } from '../blueprint-parser';

export function generateDatabaseMigrations(entities: DatabaseEntity[]): string {
  const migrations = entities.map(entity => generateTableMigration(entity)).join('\n\n');

  return `-- Supabase Migrations
-- Generated from project blueprint

${migrations}

-- Enable RLS on all tables
${entities.map(e => `ALTER TABLE ${e.name.toLowerCase()} ENABLE ROW LEVEL SECURITY;`).join('\n')}
`;
}

function generateTableMigration(entity: DatabaseEntity): string {
  const tableName = entity.name.toLowerCase();
  const fields = entity.fields.map(f => generateFieldDef(f)).join(',\n  ');

  return `CREATE TABLE IF NOT EXISTS ${tableName} (
  ${fields},
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at
CREATE INDEX IF NOT EXISTS ${tableName}_created_at_idx ON ${tableName}(created_at DESC);`;
}

function generateFieldDef(field: DatabaseField): string {
  const typeMapping: Record<string, string> = {
    'string': 'TEXT',
    'text': 'TEXT',
    'email': 'TEXT',
    'number': 'BIGINT',
    'int': 'INTEGER',
    'boolean': 'BOOLEAN',
    'json': 'JSONB',
    'date': 'DATE',
    'timestamp': 'TIMESTAMP WITH TIME ZONE',
    'uuid': 'UUID',
  };

  const pgType = typeMapping[field.type.toLowerCase()] || 'TEXT';
  const constraints = [];

  if (field.isPrimary) {
    constraints.push('PRIMARY KEY');
    constraints.push('DEFAULT gen_random_uuid()');
  }

  if (field.required && !field.isPrimary) {
    constraints.push('NOT NULL');
  }

  const constraintStr = constraints.length > 0 ? ` ${constraints.join(' ')}` : '';

  return `${field.name} ${pgType}${constraintStr}`;
}

export function generateRLSPolicies(entities: DatabaseEntity[]): string {
  const policies = entities
    .map(entity => generateTablePolicies(entity))
    .join('\n\n');

  return `-- Row Level Security Policies
-- Generated from project blueprint

${policies}
`;
}

function generateTablePolicies(entity: DatabaseEntity): string {
  const tableName = entity.name.toLowerCase();

  return `-- Policies for ${tableName}
CREATE POLICY "Allow users to view own ${tableName}"
  ON ${tableName} FOR SELECT
  USING (auth.uid() = user_id OR NOT EXISTS (SELECT 1 FROM ${tableName} WHERE user_id IS NOT NULL));

CREATE POLICY "Allow users to insert own ${tableName}"
  ON ${tableName} FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own ${tableName}"
  ON ${tableName} FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own ${tableName}"
  ON ${tableName} FOR DELETE
  USING (auth.uid() = user_id);`;
}
