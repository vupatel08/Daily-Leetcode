import { RelationshipInferrer } from '../src/services/relationship-inferrer';
import { Decision } from '@groundwork/shared';

let counter = 0;
function decision(title: string, domain: Decision['domain'], madeAtOffset = 0): Decision {
  const now = new Date(Date.now() + madeAtOffset);
  return {
    id: `d${counter++}`,
    title,
    domain,
    priority: 'P0',
    madeAt: now,
    source: 'test',
    confidence: 0.9,
    status: 'ACTIVE',
    affectedModules: [],
    createdAt: now,
    updatedAt: now,
  };
}

describe('RelationshipInferrer', () => {
  const inferrer = new RelationshipInferrer();

  it('infers database CONSTRAINS ORM', () => {
    const decisions = [
      decision('Using PostgreSQL for data layer', 'Database'),
      decision('Prisma as ORM', 'Database'),
    ];
    const edges = inferrer.infer(decisions);
    const constrains = edges.find((e) => e.type === 'CONSTRAINS');
    expect(constrains).toBeDefined();
    expect(constrains!.sourceId).toBe(decisions[0].id);
    expect(constrains!.targetId).toBe(decisions[1].id);
  });

  it('infers framework CONSTRAINS UI library', () => {
    const decisions = [
      decision('Next.js as application framework', 'Framework'),
      decision('React for UI', 'Framework'),
    ];
    const edges = inferrer.infer(decisions);
    expect(edges.some((e) => e.type === 'CONSTRAINS')).toBe(true);
  });

  it('infers auth DEPENDS_ON id format', () => {
    const decisions = [
      decision('Using JWT for authentication', 'Authentication'),
      decision('Primary keys use UUID format', 'Schema'),
    ];
    const edges = inferrer.infer(decisions);
    const dep = edges.find((e) => e.type === 'DEPENDS_ON');
    expect(dep).toBeDefined();
    expect(dep!.sourceId).toBe(decisions[0].id);
    expect(dep!.targetId).toBe(decisions[1].id);
  });

  it('does not create false edges from substrings (format != orm)', () => {
    const decisions = [
      decision('Using PostgreSQL for data layer', 'Database'),
      decision('Primary keys use UUID format', 'Schema'),
    ];
    const edges = inferrer.infer(decisions);
    // postgres should NOT "constrain" a schema format decision via the word "format"
    const bogus = edges.find(
      (e) => e.type === 'CONSTRAINS' && e.targetId === decisions[1].id
    );
    expect(bogus).toBeUndefined();
  });

  it('infers SUPERSEDES for newer decision on same subject', () => {
    const older = decision('Primary keys use auto-increment', 'Schema', 0);
    const newer = decision('Primary keys use UUID format', 'Schema', 10000);
    const edges = inferrer.infer([older, newer]);
    const sup = edges.find((e) => e.type === 'SUPERSEDES');
    expect(sup).toBeDefined();
    expect(sup!.sourceId).toBe(newer.id);
    expect(sup!.targetId).toBe(older.id);
  });

  it('ignores non-active decisions', () => {
    const d1 = decision('Using PostgreSQL', 'Database');
    const d2 = decision('Prisma as ORM', 'Database');
    d2.status = 'DISPUTED';
    const edges = inferrer.infer([d1, d2]);
    expect(edges.length).toBe(0);
  });
});
