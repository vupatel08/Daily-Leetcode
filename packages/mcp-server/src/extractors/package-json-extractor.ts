import { readFile } from 'fs/promises';
import { join } from 'path';
import { ExtractedDecision, DecisionDomain, DecisionPriority } from '@groundwork/shared';
import { Extractor } from './types';

/**
 * package.json Extractor
 *
 * Every dependency in package.json is a decision. This extractor maps
 * well-known packages to structured architectural decisions.
 */
export class PackageJsonExtractor implements Extractor {
  name = 'package-json';
  priority = 90;

  // Map of package name -> decision descriptor
  private static readonly KNOWN_PACKAGES: Record<
    string,
    { title: string; domain: DecisionDomain; priority: DecisionPriority; modules: string[] }
  > = {
    // Frameworks
    next: { title: 'Next.js as application framework', domain: 'Framework', priority: 'P0', modules: ['*'] },
    react: { title: 'React for UI', domain: 'Framework', priority: 'P0', modules: ['components', 'pages', 'app'] },
    vue: { title: 'Vue for UI', domain: 'Framework', priority: 'P0', modules: ['components'] },
    '@angular/core': { title: 'Angular as application framework', domain: 'Framework', priority: 'P0', modules: ['*'] },
    express: { title: 'Express for HTTP server', domain: 'Framework', priority: 'P0', modules: ['server', 'api', 'routes'] },
    fastify: { title: 'Fastify for HTTP server', domain: 'Framework', priority: 'P0', modules: ['server', 'api'] },
    '@nestjs/core': { title: 'NestJS as backend framework', domain: 'Framework', priority: 'P0', modules: ['*'] },
    // Databases / ORMs
    prisma: { title: 'Prisma as ORM', domain: 'Database', priority: 'P0', modules: ['database', 'models'] },
    '@prisma/client': { title: 'Prisma as ORM', domain: 'Database', priority: 'P0', modules: ['database', 'models'] },
    typeorm: { title: 'TypeORM as ORM', domain: 'Database', priority: 'P0', modules: ['database', 'entities'] },
    sequelize: { title: 'Sequelize as ORM', domain: 'Database', priority: 'P0', modules: ['database', 'models'] },
    mongoose: { title: 'Mongoose (MongoDB) for data layer', domain: 'Database', priority: 'P0', modules: ['database', 'models'] },
    'drizzle-orm': { title: 'Drizzle as ORM', domain: 'Database', priority: 'P0', modules: ['database', 'schema'] },
    pg: { title: 'PostgreSQL as database', domain: 'Database', priority: 'P0', modules: ['database'] },
    mysql2: { title: 'MySQL as database', domain: 'Database', priority: 'P0', modules: ['database'] },
    redis: { title: 'Redis for caching/data', domain: 'Infrastructure', priority: 'P1', modules: ['cache'] },
    ioredis: { title: 'Redis (ioredis) for caching/data', domain: 'Infrastructure', priority: 'P1', modules: ['cache'] },
    // Auth
    jsonwebtoken: { title: 'JWT for authentication', domain: 'Authentication', priority: 'P0', modules: ['auth', 'middleware'] },
    'next-auth': { title: 'NextAuth for authentication', domain: 'Authentication', priority: 'P0', modules: ['auth'] },
    passport: { title: 'Passport for authentication', domain: 'Authentication', priority: 'P0', modules: ['auth'] },
    bcrypt: { title: 'bcrypt for password hashing', domain: 'Security', priority: 'P0', modules: ['auth'] },
    argon2: { title: 'argon2 for password hashing', domain: 'Security', priority: 'P0', modules: ['auth'] },
    // API
    '@trpc/server': { title: 'tRPC for type-safe APIs', domain: 'API', priority: 'P0', modules: ['api', 'server'] },
    graphql: { title: 'GraphQL for API layer', domain: 'API', priority: 'P0', modules: ['api', 'schema'] },
    '@apollo/server': { title: 'Apollo Server for GraphQL', domain: 'API', priority: 'P0', modules: ['api'] },
    axios: { title: 'axios for HTTP requests', domain: 'Tooling', priority: 'P2', modules: ['*'] },
    zod: { title: 'Zod for runtime validation', domain: 'Tooling', priority: 'P1', modules: ['*'] },
    // Payments
    stripe: { title: 'Stripe for payments', domain: 'Infrastructure', priority: 'P0', modules: ['billing', 'payments'] },
    // State
    redux: { title: 'Redux for state management', domain: 'Framework', priority: 'P1', modules: ['store', 'state'] },
    zustand: { title: 'Zustand for state management', domain: 'Framework', priority: 'P1', modules: ['store', 'state'] },
    '@tanstack/react-query': { title: 'React Query for server state', domain: 'Framework', priority: 'P1', modules: ['hooks', 'api'] },
    // Styling
    tailwindcss: { title: 'TailwindCSS for styling', domain: 'Tooling', priority: 'P1', modules: ['components', 'styles'] },
    'styled-components': { title: 'styled-components for styling', domain: 'Tooling', priority: 'P1', modules: ['components'] },
  };

  private static readonly TEST_FRAMEWORKS: Record<string, string> = {
    jest: 'Jest',
    vitest: 'Vitest',
    mocha: 'Mocha',
    '@playwright/test': 'Playwright',
    cypress: 'Cypress',
    ava: 'AVA',
  };

  async canExtract(projectPath: string): Promise<boolean> {
    try {
      await readFile(join(projectPath, 'package.json'));
      return true;
    } catch {
      return false;
    }
  }

  async extract(projectPath: string): Promise<ExtractedDecision[]> {
    let pkg: any;
    try {
      const content = await readFile(join(projectPath, 'package.json'), 'utf-8');
      pkg = JSON.parse(content);
    } catch {
      return [];
    }

    const decisions: ExtractedDecision[] = [];
    const deps = { ...(pkg.dependencies || {}), ...(pkg.peerDependencies || {}) };
    const devDeps = pkg.devDependencies || {};

    for (const [name, descriptor] of Object.entries(PackageJsonExtractor.KNOWN_PACKAGES)) {
      if (deps[name]) {
        decisions.push({
          title: descriptor.title,
          domain: descriptor.domain,
          priority: descriptor.priority,
          confidence: 0.88,
          source: 'package.json',
          rationale: `${name}@${deps[name]} declared as a dependency`,
          affectedModules: descriptor.modules,
          metadata: { package: name, version: deps[name] },
        });
      }
    }

    for (const [name, label] of Object.entries(PackageJsonExtractor.TEST_FRAMEWORKS)) {
      if (devDeps[name] || deps[name]) {
        decisions.push({
          title: `${label} for testing`,
          domain: 'Testing',
          priority: 'P1',
          confidence: 0.86,
          source: 'package.json',
          rationale: `${name} declared in devDependencies`,
          affectedModules: ['tests', '__tests__', 'test', 'e2e'],
          metadata: { package: name, version: devDeps[name] || deps[name] },
        });
      }
    }

    // Module system decision
    if (pkg.type === 'module') {
      decisions.push({
        title: 'ES Modules (type: module) for the package',
        domain: 'Tooling',
        priority: 'P1',
        confidence: 0.9,
        source: 'package.json',
        affectedModules: ['*'],
      });
    }

    // Node engine constraint
    if (pkg.engines?.node) {
      decisions.push({
        title: `Node.js version constraint: ${pkg.engines.node}`,
        domain: 'Infrastructure',
        priority: 'P1',
        confidence: 0.9,
        source: 'package.json',
        affectedModules: ['*'],
        metadata: { node: pkg.engines.node },
      });
    }

    // TypeScript
    if (devDeps.typescript || deps.typescript) {
      decisions.push({
        title: 'TypeScript for type safety',
        domain: 'Framework',
        priority: 'P0',
        confidence: 0.92,
        source: 'package.json',
        affectedModules: ['*'],
      });
    }

    return decisions;
  }
}
