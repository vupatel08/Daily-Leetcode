import { readFile } from 'fs/promises';
import { join } from 'path';
import { ExtractedDecision, DecisionDomain, DecisionPriority } from '@groundwork/shared';
import { Extractor } from './types';

/**
 * CLAUDE.md Extractor
 * 
 * Extracts decisions from CLAUDE.md or AGENTS.md files.
 * These files are written by developers specifically to tell AI tools
 * what to know about the project, so they're high-signal.
 */
export class ClaudeMdExtractor implements Extractor {
  name = 'claude-md';
  priority = 100; // Highest priority

  async canExtract(projectPath: string): Promise<boolean> {
    try {
      await readFile(join(projectPath, 'CLAUDE.md'));
      return true;
    } catch {
      try {
        await readFile(join(projectPath, 'AGENTS.md'));
        return true;
      } catch {
        return false;
      }
    }
  }

  async extract(projectPath: string): Promise<ExtractedDecision[]> {
    let content: string;
    let filename: string;

    try {
      content = await readFile(join(projectPath, 'CLAUDE.md'), 'utf-8');
      filename = 'CLAUDE.md';
    } catch {
      try {
        content = await readFile(join(projectPath, 'AGENTS.md'), 'utf-8');
        filename = 'AGENTS.md';
      } catch {
        return [];
      }
    }

    console.log(`[ClaudeMdExtractor] Extracting from ${filename}`);

    // Strip markdown emphasis so "using **PostgreSQL**" matches "using PostgreSQL"
    content = content.replace(/[*`_]/g, '');

    const decisions: ExtractedDecision[] = [];

    // Extract framework/stack decisions
    const frameworkPatterns = [
      { pattern: /(?:using|built with|with) (Next\.js|React|Vue|Angular|Express|Fastify|Svelte)/gi, domain: 'Framework' as DecisionDomain },
      { pattern: /(?:using|built with|with) (Node\.js|Python|Go|Java|Rust)/gi, domain: 'Framework' as DecisionDomain },
      { pattern: /(TypeScript|JavaScript) (?:project|for)/gi, domain: 'Framework' as DecisionDomain }
    ];

    for (const { pattern, domain } of frameworkPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          decisions.push({
            title: `Using ${this.extractTechnology(match)} as primary technology`,
            domain,
            priority: 'P0' as DecisionPriority,
            confidence: 0.95,
            source: filename,
            rationale: `Explicitly stated in ${filename}`,
            affectedModules: ['*']
          });
        });
      }
    }

    // Extract database decisions
    const dbPatterns = [
      /(?:using|with) (PostgreSQL|MySQL|MongoDB|Redis|SQLite)/gi,
      /database:?\s*(PostgreSQL|MySQL|MongoDB|Redis|SQLite)/gi,
      /(Prisma|TypeORM|Sequelize|Mongoose)(?:\s+ORM)?/gi
    ];

    for (const pattern of dbPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          decisions.push({
            title: `Using ${this.extractTechnology(match)} for data layer`,
            domain: 'Database' as DecisionDomain,
            priority: 'P0' as DecisionPriority,
            confidence: 0.95,
            source: filename,
            affectedModules: ['database', 'models', 'schemas']
          });
        });
      }
    }

    // Extract authentication decisions
    const authPatterns = [
      /authentication:?\s*(JWT|OAuth|Session)/gi,
      /(JWT|OAuth|sessions?)\s+(?:tokens?\s+)?(?:for\s+)?auth/gi,
      /(NextAuth|Passport|Auth0)/gi
    ];

    for (const pattern of authPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          decisions.push({
            title: `Using ${this.extractTechnology(match)} for authentication`,
            domain: 'Authentication' as DecisionDomain,
            priority: 'P0' as DecisionPriority,
            confidence: 0.93,
            source: filename,
            affectedModules: ['auth', 'api', 'middleware']
          });
        });
      }
    }

    // Extract API style decisions
    if (content.match(/REST API/i)) {
      decisions.push({
        title: 'REST API architecture',
        domain: 'API' as DecisionDomain,
        priority: 'P0' as DecisionPriority,
        confidence: 0.90,
        source: filename,
        affectedModules: ['api', 'routes', 'endpoints']
      });
    }

    if (content.match(/GraphQL/i)) {
      decisions.push({
        title: 'GraphQL API architecture',
        domain: 'API' as DecisionDomain,
        priority: 'P0' as DecisionPriority,
        confidence: 0.90,
        source: filename,
        affectedModules: ['api', 'resolvers', 'schema']
      });
    }

    if (content.match(/tRPC/i)) {
      decisions.push({
        title: 'tRPC for type-safe APIs',
        domain: 'API' as DecisionDomain,
        priority: 'P0' as DecisionPriority,
        confidence: 0.92,
        source: filename,
        affectedModules: ['api', 'server', 'client']
      });
    }

    // Extract testing decisions
    const testPatterns = [
      /testing with (Jest|Vitest|Mocha|Playwright|Cypress)/gi,
      /test framework: (Jest|Vitest|Mocha)/gi
    ];

    for (const pattern of testPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          decisions.push({
            title: `Using ${this.extractTechnology(match)} for testing`,
            domain: 'Testing' as DecisionDomain,
            priority: 'P1' as DecisionPriority,
            confidence: 0.88,
            source: filename,
            affectedModules: ['tests', '__tests__', 'test']
          });
        });
      }
    }

    // Extract coding conventions
    if (content.match(/camelCase/i)) {
      decisions.push({
        title: 'camelCase naming convention for JavaScript/TypeScript',
        domain: 'Other' as DecisionDomain,
        priority: 'P2' as DecisionPriority,
        confidence: 0.85,
        source: filename
      });
    }

    if (content.match(/snake_case/i)) {
      decisions.push({
        title: 'snake_case naming convention for database fields',
        domain: 'Schema' as DecisionDomain,
        priority: 'P1' as DecisionPriority,
        confidence: 0.85,
        source: filename
      });
    }

    // Deduplicate by title
    const uniqueDecisions = this.deduplicateByTitle(decisions);

    console.log(`[ClaudeMdExtractor] Extracted ${uniqueDecisions.length} decisions from ${filename}`);
    return uniqueDecisions;
  }

  private extractTechnology(match: string): string {
    // Extract the technology name from the match
    const techs = [
      'Next.js', 'React', 'Vue', 'Angular', 'Express', 'Fastify',
      'Node.js', 'Python', 'Go', 'Java', 'Rust', 'TypeScript', 'JavaScript',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
      'Prisma', 'TypeORM', 'Sequelize', 'Mongoose',
      'JWT', 'OAuth', 'Session', 'NextAuth', 'Passport', 'Auth0',
      'Jest', 'Vitest', 'Mocha', 'Playwright', 'Cypress',
      'tRPC'
    ];

    for (const tech of techs) {
      if (match.toLowerCase().includes(tech.toLowerCase())) {
        return tech;
      }
    }

    return match;
  }

  private deduplicateByTitle(decisions: ExtractedDecision[]): ExtractedDecision[] {
    const seen = new Set<string>();
    return decisions.filter(d => {
      if (seen.has(d.title)) {
        return false;
      }
      seen.add(d.title);
      return true;
    });
  }
}
