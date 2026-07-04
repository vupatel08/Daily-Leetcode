import { PackageJsonExtractor } from '../src/extractors/package-json-extractor';
import { PrismaSchemaExtractor } from '../src/extractors/prisma-schema-extractor';
import { ClaudeMdExtractor } from '../src/extractors/claude-md-extractor';
import { ExtractionPipeline } from '../src/extractors/pipeline';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function makeProject(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'gw-test-'));
  for (const [path, content] of Object.entries(files)) {
    const full = join(dir, path);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, content);
  }
  return dir;
}

describe('Extractors', () => {
  it('PackageJsonExtractor maps dependencies to decisions', async () => {
    const dir = makeProject({
      'package.json': JSON.stringify({
        dependencies: { next: '14', '@prisma/client': '5', stripe: '14' },
        devDependencies: { jest: '29', typescript: '5' },
        type: 'module',
      }),
    });
    const decisions = await new PackageJsonExtractor().extract(dir);
    const titles = decisions.map((d) => d.title);
    expect(titles).toContain('Next.js as application framework');
    expect(titles).toContain('Prisma as ORM');
    expect(titles).toContain('Stripe for payments');
    expect(titles).toContain('Jest for testing');
    expect(titles.some((t) => /ES Modules/.test(t))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it('PrismaSchemaExtractor detects provider, UUID, timestamps, soft delete', async () => {
    const dir = makeProject({
      'prisma/schema.prisma': `
datasource db { provider = "postgresql" }
model User {
  id String @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
}`,
    });
    const decisions = await new PrismaSchemaExtractor().extract(dir);
    const titles = decisions.map((d) => d.title);
    expect(titles).toContain('Database provider: postgresql');
    expect(titles).toContain('Primary keys use UUID format');
    expect(titles).toContain('Soft-delete pattern using deletedAt column');
    rmSync(dir, { recursive: true, force: true });
  });

  it('ClaudeMdExtractor strips markdown and extracts stack', async () => {
    const dir = makeProject({
      'CLAUDE.md': 'Built with **Next.js**. Using **PostgreSQL** with **Prisma**. Authentication: **JWT**.',
    });
    const decisions = await new ClaudeMdExtractor().extract(dir);
    const titles = decisions.map((d) => d.title.toLowerCase());
    expect(titles.some((t) => t.includes('next.js'))).toBe(true);
    expect(titles.some((t) => t.includes('postgresql'))).toBe(true);
    expect(titles.some((t) => t.includes('jwt'))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });

  it('ExtractionPipeline dedupes across extractors', async () => {
    const dir = makeProject({
      'package.json': JSON.stringify({ dependencies: { '@prisma/client': '5' } }),
      'prisma/schema.prisma': 'datasource db { provider = "postgresql" }\nmodel A { id String @id @default(uuid()) }',
      'CLAUDE.md': 'Using **Prisma** and **PostgreSQL**.',
    });
    const decisions = await new ExtractionPipeline().run(dir);
    // No two decisions share a normalized title
    const norm = decisions.map((d) => d.title.toLowerCase().replace(/\s+/g, ' ').trim());
    expect(new Set(norm).size).toBe(norm.length);
    expect(decisions.length).toBeGreaterThan(3);
    rmSync(dir, { recursive: true, force: true });
  });
});
