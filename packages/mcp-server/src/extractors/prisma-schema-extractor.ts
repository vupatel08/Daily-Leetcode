import { readFile } from 'fs/promises';
import { join } from 'path';
import { ExtractedDecision } from '@groundwork/shared';
import { Extractor } from './types';

/**
 * Prisma Schema Extractor
 *
 * Analyzes schema.prisma to surface schema-level decisions:
 * - Database provider
 * - Primary key / ID format (uuid, cuid, autoincrement)
 * - Timestamp conventions
 * - Soft delete patterns
 */
export class PrismaSchemaExtractor implements Extractor {
  name = 'prisma-schema';
  priority = 92;

  private static readonly CANDIDATE_PATHS = [
    'prisma/schema.prisma',
    'schema.prisma',
    'src/prisma/schema.prisma',
  ];

  private async findSchema(projectPath: string): Promise<{ path: string; content: string } | null> {
    for (const candidate of PrismaSchemaExtractor.CANDIDATE_PATHS) {
      try {
        const full = join(projectPath, candidate);
        const content = await readFile(full, 'utf-8');
        return { path: candidate, content };
      } catch {
        // try next
      }
    }
    return null;
  }

  async canExtract(projectPath: string): Promise<boolean> {
    return (await this.findSchema(projectPath)) !== null;
  }

  async extract(projectPath: string): Promise<ExtractedDecision[]> {
    const schema = await this.findSchema(projectPath);
    if (!schema) return [];

    const { content, path } = schema;
    const decisions: ExtractedDecision[] = [];

    // Database provider
    const providerMatch = content.match(/provider\s*=\s*"(postgresql|mysql|sqlite|mongodb|sqlserver|cockroachdb)"/);
    if (providerMatch) {
      decisions.push({
        title: `Database provider: ${providerMatch[1]}`,
        domain: 'Database',
        priority: 'P0',
        confidence: 0.95,
        source: path,
        rationale: 'Declared in Prisma datasource block',
        affectedModules: ['database', 'models'],
        metadata: { provider: providerMatch[1] },
      });
    }

    // ID format detection
    if (/@default\(uuid\(\)\)/.test(content)) {
      decisions.push({
        title: 'Primary keys use UUID format',
        domain: 'Schema',
        priority: 'P0',
        confidence: 0.93,
        source: path,
        rationale: '@default(uuid()) present in schema',
        alternatives: ['autoincrement integers', 'cuid'],
        affectedModules: ['database', 'models', 'api'],
      });
    } else if (/@default\(cuid\(\)\)/.test(content)) {
      decisions.push({
        title: 'Primary keys use CUID format',
        domain: 'Schema',
        priority: 'P0',
        confidence: 0.93,
        source: path,
        rationale: '@default(cuid()) present in schema',
        alternatives: ['autoincrement integers', 'uuid'],
        affectedModules: ['database', 'models', 'api'],
      });
    } else if (/@default\(autoincrement\(\)\)/.test(content)) {
      decisions.push({
        title: 'Primary keys use auto-increment integers',
        domain: 'Schema',
        priority: 'P0',
        confidence: 0.9,
        source: path,
        rationale: '@default(autoincrement()) present in schema',
        alternatives: ['uuid', 'cuid'],
        affectedModules: ['database', 'models', 'api'],
      });
    }

    // Timestamp conventions
    const hasCreatedAt = /createdAt\s+DateTime\s+@default\(now\(\)\)/.test(content);
    const hasUpdatedAt = /updatedAt\s+DateTime\s+@updatedAt/.test(content);
    if (hasCreatedAt && hasUpdatedAt) {
      decisions.push({
        title: 'Models include createdAt/updatedAt timestamps',
        domain: 'Schema',
        priority: 'P1',
        confidence: 0.9,
        source: path,
        rationale: 'createdAt @default(now()) and updatedAt @updatedAt found',
        affectedModules: ['database', 'models'],
      });
    }

    // Soft delete
    if (/deletedAt\s+DateTime\?/.test(content)) {
      decisions.push({
        title: 'Soft-delete pattern using deletedAt column',
        domain: 'Schema',
        priority: 'P0',
        confidence: 0.9,
        source: path,
        rationale: 'Nullable deletedAt column present',
        affectedModules: ['database', 'models', 'api'],
      });
    }

    // Count models to gauge coverage
    const modelCount = (content.match(/^\s*model\s+\w+\s*\{/gm) || []).length;
    if (modelCount > 0) {
      decisions.push({
        title: `Prisma schema defines ${modelCount} data model(s)`,
        domain: 'Schema',
        priority: 'P2',
        confidence: 0.8,
        source: path,
        affectedModules: ['database', 'models'],
        metadata: { modelCount },
      });
    }

    return decisions;
  }
}
