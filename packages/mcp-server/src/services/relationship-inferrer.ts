import { Decision, RelationshipType } from '@groundwork/shared';

export interface InferredRelationship {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  reason: string;
}

/**
 * RelationshipInferrer
 *
 * Derives the edges of the decision graph from the decisions themselves.
 * This is what turns a flat list of decisions into an actual graph.
 *
 * Edge types produced:
 *   - CONSTRAINS:  a foundational choice limits a dependent one
 *                  (database provider -> ORM -> query style, framework -> UI lib)
 *   - DEPENDS_ON:  a decision relies on another to make sense
 *                  (auth strategy -> ID/schema format)
 *   - SUPERSEDES:  a newer decision replaces an older one on the same subject
 *
 * Rules are intentionally conservative and explainable (each edge carries a
 * human-readable reason), matching Groundwork's precision-over-recall stance.
 */
export class RelationshipInferrer {
  /**
   * CONSTRAINS rules: if a decision matches `from` and another matches `to`
   * (optionally within/into a domain), the `from` decision constrains `to`.
   */
  private static readonly CONSTRAINS: {
    from: RegExp;
    to: RegExp;
    reason: string;
  }[] = [
    // Database provider constrains the ORM
    { from: /\bpostgres|\bmysql|\bmongodb|\bsqlite/i, to: /\bprisma\b|\btypeorm\b|\bsequelize\b|\bmongoose\b|\bdrizzle\b|\borm\b/i, reason: 'database provider constrains ORM choice' },
    // ORM constrains query style / raw SQL
    { from: /\bprisma\b|\btypeorm\b|\bsequelize\b|\bdrizzle\b|\borm\b/i, to: /raw sql|no raw sql|query builder/i, reason: 'ORM constrains how queries are written' },
    // Framework constrains UI library / styling
    { from: /next\.js|nextjs/i, to: /react for ui|\breact\b|tailwind|styled-components/i, reason: 'framework constrains UI/styling choices' },
    // Language constrains tooling
    { from: /typescript/i, to: /\bzod\b|\beslint\b|type safety/i, reason: 'language choice constrains tooling' },
    // Auth provider constrains auth strategy
    { from: /nextauth/i, to: /\bjwt\b|\boauth\b|\bsession\b/i, reason: 'auth provider constrains auth strategy' },
  ];

  /**
   * DEPENDS_ON rules: a decision matching `dependent` depends on a decision
   * matching `dependency`.
   */
  private static readonly DEPENDS_ON: {
    dependent: RegExp;
    dependency: RegExp;
    reason: string;
  }[] = [
    // Auth depends on the user ID / schema format
    { dependent: /\bjwt\b|\boauth\b|\bsession\b|nextauth|authentication/i, dependency: /\buuid\b|\bcuid\b|auto-?increment|primary key/i, reason: 'auth references user IDs' },
    // Payments depend on user identity
    { dependent: /\bstripe\b|payment|billing/i, dependency: /\buuid\b|\bcuid\b|primary key|authentication/i, reason: 'payments reference user identity' },
    // Password hashing depends on auth strategy
    { dependent: /\bbcrypt\b|\bargon2\b|password hashing/i, dependency: /authentication|\bjwt\b|\bsession\b|nextauth/i, reason: 'hashing supports the auth strategy' },
  ];

  /**
   * Infer all relationships across the given (active) decisions.
   */
  infer(decisions: Decision[]): InferredRelationship[] {
    const active = decisions.filter((d) => d.status === 'ACTIVE');
    const edges: InferredRelationship[] = [];
    const seen = new Set<string>();

    const add = (sourceId: string, targetId: string, type: RelationshipType, reason: string) => {
      if (sourceId === targetId) return;
      const key = `${sourceId}|${targetId}|${type}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ sourceId, targetId, type, reason });
    };

    // CONSTRAINS
    for (const rule of RelationshipInferrer.CONSTRAINS) {
      const froms = active.filter((d) => rule.from.test(this.textOf(d)));
      const tos = active.filter((d) => rule.to.test(this.textOf(d)));
      for (const f of froms) {
        for (const t of tos) {
          if (f.id !== t.id) add(f.id, t.id, 'CONSTRAINS', rule.reason);
        }
      }
    }

    // DEPENDS_ON
    for (const rule of RelationshipInferrer.DEPENDS_ON) {
      const dependents = active.filter((d) => rule.dependent.test(this.textOf(d)));
      const dependencies = active.filter((d) => rule.dependency.test(this.textOf(d)));
      for (const dep of dependents) {
        for (const on of dependencies) {
          if (dep.id !== on.id) add(dep.id, on.id, 'DEPENDS_ON', rule.reason);
        }
      }
    }

    // SUPERSEDES: newer ACTIVE decision on the same subject supersedes older
    edges.push(...this.inferSupersedes(active, seen));

    return edges;
  }

  /**
   * When two ACTIVE decisions share the same normalized subject, the newer
   * one supersedes the older. (Genuinely-conflicting subjects are handled by
   * the ConflictDetector; this covers refinements of the same subject.)
   */
  private inferSupersedes(active: Decision[], seen: Set<string>): InferredRelationship[] {
    const bySubject = new Map<string, Decision[]>();
    for (const d of active) {
      const subject = this.subjectOf(d);
      if (!subject) continue;
      const list = bySubject.get(subject) || [];
      list.push(d);
      bySubject.set(subject, list);
    }

    const edges: InferredRelationship[] = [];
    for (const [, group] of bySubject) {
      if (group.length < 2) continue;
      const sorted = [...group].sort((a, b) => a.madeAt.getTime() - b.madeAt.getTime());
      for (let i = 1; i < sorted.length; i++) {
        const newer = sorted[i];
        const older = sorted[i - 1];
        const key = `${newer.id}|${older.id}|SUPERSEDES`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({
          sourceId: newer.id,
          targetId: older.id,
          type: 'SUPERSEDES',
          reason: `refines earlier decision on "${this.subjectOf(newer)}"`,
        });
      }
    }
    return edges;
  }

  private textOf(d: Decision): string {
    return `${d.title} ${d.rationale || ''}`.toLowerCase();
  }

  /**
   * A coarse "subject" key used only for SUPERSEDES grouping. Two decisions
   * about e.g. "primary key format" in Schema share a subject.
   */
  private subjectOf(d: Decision): string | null {
    const t = this.textOf(d);
    if (/primary key|@id|uuid|cuid|auto-?increment/.test(t)) return 'schema:primary-key';
    if (/rest|graphql|trpc/.test(t) && d.domain === 'API') return 'api:style';
    if (/jwt|oauth|session|nextauth/.test(t) && d.domain === 'Authentication') return 'auth:strategy';
    return null;
  }
}
