import { Decision, InjectionContext } from '@groundwork/shared';

/**
 * InjectionEngine
 *
 * Selects and formats the most relevant decisions to inject into an AI
 * coding session's context. Selection is priority-aware and relevance-ranked:
 *
 *   - P0 decisions relevant to the current domain/module are ALWAYS injected.
 *   - P1 decisions are injected when they match the domain/module or the
 *     developer's first message.
 *   - P2 decisions are only injected on explicit request.
 *
 * The output is a compact, structured text block suitable for placement
 * below an AI system prompt.
 */
export class InjectionEngine {
  private maxDecisions: number;

  constructor(maxDecisions = 15) {
    this.maxDecisions = maxDecisions;
  }

  /**
   * Rank + filter decisions for a given session context.
   */
  select(decisions: Decision[], context: InjectionContext, includeP2 = false): Decision[] {
    const scored = decisions
      .filter((d) => d.status === 'ACTIVE')
      .map((d) => ({ decision: d, score: this.score(d, context) }))
      .filter((s) => s.score > 0);

    // P0 always included regardless of score threshold
    const p0 = scored.filter((s) => s.decision.priority === 'P0');
    const p1 = scored.filter((s) => s.decision.priority === 'P1');
    const p2 = includeP2 ? scored.filter((s) => s.decision.priority === 'P2') : [];

    const ordered = [...p0, ...p1, ...p2]
      .sort((a, b) => b.score - a.score)
      .map((s) => s.decision);

    // Always keep every relevant P0 even if we exceed the soft cap.
    const p0Decisions = ordered.filter((d) => d.priority === 'P0');
    const rest = ordered.filter((d) => d.priority !== 'P0');
    const budget = Math.max(this.maxDecisions - p0Decisions.length, 0);

    return [...p0Decisions, ...rest.slice(0, budget)];
  }

  /**
   * Relevance score for a decision given the current context.
   * Combines priority weight, module match, domain match and keyword overlap.
   */
  private score(decision: Decision, context: InjectionContext): number {
    let score = 0;

    // Base weight by priority
    score += decision.priority === 'P0' ? 100 : decision.priority === 'P1' ? 40 : 10;

    // Module match
    const modules = decision.affectedModules || [];
    if (modules.includes('*')) {
      score += 20;
    }
    if (context.currentModule) {
      const mod = context.currentModule.toLowerCase();
      if (modules.some((m) => m.toLowerCase() === mod || mod.includes(m.toLowerCase()))) {
        score += 60;
      }
    }

    // File path match against affected modules
    if (context.currentFile) {
      const file = context.currentFile.toLowerCase();
      if (modules.some((m) => m !== '*' && file.includes(m.toLowerCase()))) {
        score += 40;
      }
    }

    // Domain keyword match from first message
    if (context.firstMessage) {
      const msg = context.firstMessage.toLowerCase();
      if (msg.includes(decision.domain.toLowerCase())) {
        score += 30;
      }
      // Title token overlap
      const tokens = decision.title.toLowerCase().split(/\W+/).filter((t) => t.length > 3);
      const overlap = tokens.filter((t) => msg.includes(t)).length;
      score += overlap * 8;
    }

    return score;
  }

  /**
   * Render selected decisions as an injectable text block.
   */
  format(decisions: Decision[]): string {
    if (decisions.length === 0) {
      return '';
    }

    const lines: string[] = [];
    lines.push('## Team Architectural Decisions (via Groundwork)');
    lines.push('');
    lines.push(
      'The following decisions have already been made by your team. ' +
        'Respect them. If a request conflicts with one, flag it before proceeding.'
    );
    lines.push('');

    const byPriority: Record<string, Decision[]> = { P0: [], P1: [], P2: [] };
    for (const d of decisions) byPriority[d.priority].push(d);

    const labels: Record<string, string> = {
      P0: 'CRITICAL (must never be violated)',
      P1: 'IMPORTANT (follow unless there is a strong reason)',
      P2: 'GUIDANCE',
    };

    for (const priority of ['P0', 'P1', 'P2']) {
      const group = byPriority[priority];
      if (group.length === 0) continue;
      lines.push(`### ${labels[priority]}`);
      for (const d of group) {
        let line = `- ${d.title}`;
        if (d.rationale) line += ` — ${d.rationale}`;
        if (d.madeBy) line += ` (decided by ${d.madeBy})`;
        lines.push(line);
      }
      lines.push('');
    }

    return lines.join('\n').trim();
  }

  /**
   * Convenience: select + format in one call.
   */
  build(decisions: Decision[], context: InjectionContext, includeP2 = false): string {
    return this.format(this.select(decisions, context, includeP2));
  }
}
