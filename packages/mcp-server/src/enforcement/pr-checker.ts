import { Decision } from '@groundwork/shared';

export interface FileChange {
  /** File path relative to repo root */
  path: string;
  /** The added/changed content to analyze (e.g. added lines from the diff) */
  content: string;
}

export interface Violation {
  decision: Decision;
  file: string;
  line?: number;
  snippet: string;
  message: string;
  priority: Decision['priority'];
}

export interface CheckResult {
  violations: Violation[];
  p0: Violation[];
  p1: Violation[];
  p2: Violation[];
  passed: boolean;
}

/**
 * A ViolationRule connects a decision (matched by predicate) to a code
 * pattern that would violate it.
 */
interface ViolationRule {
  /** Whether this rule applies given a decision in the graph */
  matches: (d: Decision) => boolean;
  /** Regex whose match in changed code indicates a violation */
  pattern: RegExp;
  /** Only check files whose path matches (optional) */
  fileFilter?: RegExp;
  /** Human-readable violation message */
  message: (d: Decision) => string;
}

/**
 * PRChecker
 *
 * Analyzes changed files against the active decision graph and reports
 * violations. High-precision, pattern-based checks for the highest-value
 * P0 decisions (ID format, ORM/raw-SQL, auth strategy, DB provider).
 */
export class PRChecker {
  private static readonly RULES: ViolationRule[] = [
    // UUID IDs decided -> integer/serial primary keys are a violation
    {
      matches: (d) => /uuid/i.test(d.title) && d.domain === 'Schema',
      pattern: /@id\s+@default\(autoincrement\(\)\)|@id.*\bInt\b|\bid\b[^\n]*\b(serial|bigserial)\b|id\s+INT(EGER)?\s+PRIMARY\s+KEY/i,
      message: (d) => `Integer/auto-increment primary key conflicts with decision: "${d.title}"`,
    },
    // Auto-increment/integer IDs decided -> uuid() usage is a violation
    {
      matches: (d) => /(auto-?increment|integer)/i.test(d.title) && d.domain === 'Schema',
      pattern: /@default\(uuid\(\)\)|gen_random_uuid\(\)|uuid_generate_v4\(\)/i,
      message: (d) => `UUID primary key conflicts with decision: "${d.title}"`,
    },
    // ORM decided -> raw SQL is a violation
    {
      matches: (d) => /(prisma|typeorm|sequelize|drizzle|orm)/i.test(d.title) && d.domain === 'Database',
      pattern: /\$queryRaw|\$executeRaw|\bclient\.query\(|\bpool\.query\(|\bconnection\.query\(/,
      fileFilter: /\.(ts|js|tsx|jsx)$/,
      message: (d) => `Raw SQL query conflicts with ORM decision: "${d.title}"`,
    },
    // Postgres decided -> connecting to a different DB is a violation
    {
      matches: (d) => /postgres/i.test(d.title) && d.domain === 'Database',
      pattern: /mongoose\.connect|new\s+MongoClient|createConnection\(\s*['"]mysql|mysql\.createConnection/i,
      message: (d) => `Connecting to a non-Postgres database conflicts with decision: "${d.title}"`,
    },
    // bcrypt decided -> md5/sha1 for passwords is a violation
    {
      matches: (d) => /bcrypt/i.test(d.title) && d.domain === 'Security',
      pattern: /createHash\(\s*['"](md5|sha1)['"]\s*\)/i,
      message: (d) => `Weak password hashing conflicts with decision: "${d.title}"`,
    },
  ];

  /**
   * Run all rules over the changed files, given the active decisions.
   */
  check(decisions: Decision[], changes: FileChange[]): CheckResult {
    const active = decisions.filter((d) => d.status === 'ACTIVE');
    const violations: Violation[] = [];

    for (const rule of PRChecker.RULES) {
      const matched = active.filter(rule.matches);
      if (matched.length === 0) continue;

      for (const change of changes) {
        if (rule.fileFilter && !rule.fileFilter.test(change.path)) continue;

        const lines = change.content.split('\n');
        lines.forEach((line, idx) => {
          if (rule.pattern.test(line)) {
            // Attribute to the highest-priority matching decision
            const decision = matched.sort((a, b) => this.rank(a) - this.rank(b))[0];
            violations.push({
              decision,
              file: change.path,
              line: idx + 1,
              snippet: line.trim().slice(0, 160),
              message: rule.message(decision),
              priority: decision.priority,
            });
          }
        });
      }
    }

    const p0 = violations.filter((v) => v.priority === 'P0');
    const p1 = violations.filter((v) => v.priority === 'P1');
    const p2 = violations.filter((v) => v.priority === 'P2');

    return { violations, p0, p1, p2, passed: p0.length === 0 };
  }

  /**
   * Render a Markdown report suitable for a PR comment.
   */
  formatReport(result: CheckResult): string {
    const lines: string[] = ['## Groundwork Decision Check', ''];

    if (result.violations.length === 0) {
      lines.push('✅ **No violations found** — all changes comply with team decisions.');
      lines.push('');
      lines.push('---');
      lines.push('_Powered by [Groundwork](https://groundwork.dev)_');
      return lines.join('\n');
    }

    if (result.p0.length > 0) {
      lines.push(`### ❌ ${result.p0.length} Critical (P0) violation(s) — merge blocked`);
      lines.push('');
      for (const v of result.p0) lines.push(this.formatViolation(v));
      lines.push('');
    }
    if (result.p1.length > 0) {
      lines.push(`### ⚠️ ${result.p1.length} Warning (P1)`);
      lines.push('');
      for (const v of result.p1) lines.push(this.formatViolation(v));
      lines.push('');
    }
    if (result.p2.length > 0) {
      lines.push(`### ℹ️ ${result.p2.length} Note (P2)`);
      lines.push('');
      for (const v of result.p2) lines.push(this.formatViolation(v));
      lines.push('');
    }

    lines.push('---');
    lines.push('_Powered by [Groundwork](https://groundwork.dev)_');
    return lines.join('\n');
  }

  private formatViolation(v: Violation): string {
    const loc = v.line ? `\`${v.file}:${v.line}\`` : `\`${v.file}\``;
    let out = `- **${v.message}**\n  - ${loc}\n  - \`${v.snippet}\``;
    if (v.decision.madeBy) out += `\n  - decided by ${v.decision.madeBy}`;
    if (v.decision.rationale) out += `\n  - rationale: ${v.decision.rationale}`;
    return out;
  }

  private rank(d: Decision): number {
    return d.priority === 'P0' ? 0 : d.priority === 'P1' ? 1 : 2;
  }
}
