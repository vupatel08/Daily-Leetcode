import { Decision, ExtractedDecision, Conflict } from '@groundwork/shared';

export interface PotentialConflict {
  description: string;
  existing: Decision;
  incomingTitle: string;
  confidence: number;
}

/**
 * ConflictDetector
 *
 * Detects contradictions between a new (incoming) decision and the existing
 * decision graph. The MVP uses rule-based detection across a set of mutually
 * exclusive decision categories (e.g. two different primary databases), plus
 * a lightweight lexical "same subject, different object" heuristic.
 *
 * This is intentionally high-precision (few false positives) rather than
 * high-recall — enforcing a wrong conflict erodes trust faster than missing one.
 */
export class ConflictDetector {
  // Groups of terms that are mutually exclusive within a domain. If an existing
  // decision matches one term and the incoming decision matches a *different*
  // term in the same group (same domain), that's a conflict.
  private static readonly EXCLUSIVE_GROUPS: {
    domain: string;
    terms: string[];
    subject: string;
  }[] = [
    { domain: 'Database', subject: 'primary database', terms: ['postgresql', 'postgres', 'mysql', 'mongodb', 'sqlite', 'cockroachdb'] },
    { domain: 'Database', subject: 'ORM', terms: ['prisma', 'typeorm', 'sequelize', 'mongoose', 'drizzle'] },
    { domain: 'Schema', subject: 'primary key format', terms: ['uuid', 'cuid', 'auto-increment', 'autoincrement', 'integer'] },
    { domain: 'API', subject: 'API style', terms: ['rest', 'graphql', 'trpc'] },
    { domain: 'Authentication', subject: 'auth strategy', terms: ['jwt', 'oauth', 'session', 'nextauth'] },
    { domain: 'Framework', subject: 'frontend framework', terms: ['react', 'vue', 'angular', 'svelte'] },
    { domain: 'Security', subject: 'password hashing', terms: ['bcrypt', 'argon2', 'scrypt', 'pbkdf2'] },
  ];

  /**
   * Check an incoming extracted decision against the existing graph.
   */
  detect(incoming: ExtractedDecision, existing: Decision[]): PotentialConflict[] {
    const conflicts: PotentialConflict[] = [];
    const incomingText = `${incoming.title} ${incoming.rationale || ''}`.toLowerCase();

    for (const group of ConflictDetector.EXCLUSIVE_GROUPS) {
      const incomingTerm = group.terms.find((t) => this.matchesTerm(incomingText, t));
      if (!incomingTerm) continue;

      for (const decision of existing) {
        if (decision.status !== 'ACTIVE') continue;
        if (decision.domain !== group.domain && incoming.domain !== group.domain) continue;

        const existingText = `${decision.title} ${decision.rationale || ''}`.toLowerCase();
        const existingTerm = group.terms.find((t) => this.matchesTerm(existingText, t));

        if (existingTerm && !this.sameTerm(existingTerm, incomingTerm)) {
          conflicts.push({
            description: `Conflicting ${group.subject}: incoming "${incomingTerm}" vs existing "${existingTerm}"`,
            existing: decision,
            incomingTitle: incoming.title,
            confidence: 0.9,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect conflicts among a set of decisions (e.g. for a full-graph audit).
   * Returns pairs that contradict each other.
   */
  detectPairs(decisions: Decision[]): { a: Decision; b: Decision; description: string }[] {
    const pairs: { a: Decision; b: Decision; description: string }[] = [];

    for (const group of ConflictDetector.EXCLUSIVE_GROUPS) {
      const matched: { decision: Decision; term: string }[] = [];
      for (const d of decisions) {
        if (d.status !== 'ACTIVE') continue;
        if (d.domain !== group.domain) continue;
        const text = `${d.title} ${d.rationale || ''}`.toLowerCase();
        const term = group.terms.find((t) => this.matchesTerm(text, t));
        if (term) matched.push({ decision: d, term });
      }

      for (let i = 0; i < matched.length; i++) {
        for (let j = i + 1; j < matched.length; j++) {
          if (!this.sameTerm(matched[i].term, matched[j].term)) {
            pairs.push({
              a: matched[i].decision,
              b: matched[j].decision,
              description: `Conflicting ${group.subject}: "${matched[i].term}" vs "${matched[j].term}"`,
            });
          }
        }
      }
    }

    return pairs;
  }

  private matchesTerm(text: string, term: string): boolean {
    // word-boundary-ish match to avoid e.g. "post" matching "postgres"
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, 'i').test(text);
  }

  private sameTerm(a: string, b: string): boolean {
    const norm = (t: string) => t.replace(/[-\s]/g, '');
    // treat postgres/postgresql and autoincrement/auto-increment as equal
    const aliases: Record<string, string> = {
      postgres: 'postgresql',
      autoincrement: 'autoincrement',
      'auto-increment': 'autoincrement',
      integer: 'autoincrement',
    };
    const na = aliases[a.toLowerCase()] || norm(a.toLowerCase());
    const nb = aliases[b.toLowerCase()] || norm(b.toLowerCase());
    return na === nb;
  }
}
