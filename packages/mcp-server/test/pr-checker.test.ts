import { PRChecker } from '../src/enforcement/pr-checker';
import { Decision } from '@groundwork/shared';

function decision(partial: Partial<Decision>): Decision {
  const now = new Date();
  return {
    id: Math.random().toString(36).slice(2),
    title: 'Untitled',
    domain: 'Other',
    priority: 'P0',
    madeAt: now,
    source: 'test',
    confidence: 0.9,
    status: 'ACTIVE',
    affectedModules: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('PRChecker', () => {
  const checker = new PRChecker();

  it('blocks integer PK when UUID is decided', () => {
    const decisions = [decision({ title: 'Primary keys use UUID format', domain: 'Schema' })];
    const result = checker.check(decisions, [
      { path: 'prisma/schema.prisma', content: 'id Int @id @default(autoincrement())' },
    ]);
    expect(result.passed).toBe(false);
    expect(result.p0.length).toBe(1);
  });

  it('flags raw SQL when an ORM is decided', () => {
    const decisions = [decision({ title: 'Prisma as ORM', domain: 'Database' })];
    const result = checker.check(decisions, [
      { path: 'src/db.ts', content: 'const r = await client.query("SELECT 1");' },
    ]);
    expect(result.p0.length).toBe(1);
    expect(result.p0[0].message).toMatch(/raw sql/i);
  });

  it('passes clean diffs', () => {
    const decisions = [decision({ title: 'Primary keys use UUID format', domain: 'Schema' })];
    const result = checker.check(decisions, [
      { path: 'src/util.ts', content: 'export const add = (a, b) => a + b;' },
    ]);
    expect(result.passed).toBe(true);
    expect(result.violations.length).toBe(0);
  });

  it('ignores decisions that are not ACTIVE', () => {
    const decisions = [decision({ title: 'Primary keys use UUID format', domain: 'Schema', status: 'DISPUTED' })];
    const result = checker.check(decisions, [
      { path: 'prisma/schema.prisma', content: 'id Int @id @default(autoincrement())' },
    ]);
    expect(result.violations.length).toBe(0);
  });

  it('produces a markdown report', () => {
    const decisions = [decision({ title: 'Primary keys use UUID format', domain: 'Schema' })];
    const result = checker.check(decisions, [
      { path: 'prisma/schema.prisma', content: 'id Int @id @default(autoincrement())' },
    ]);
    const report = checker.formatReport(result);
    expect(report).toContain('Groundwork Decision Check');
    expect(report).toContain('merge blocked');
  });
});
