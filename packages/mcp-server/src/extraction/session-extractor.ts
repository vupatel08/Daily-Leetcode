import { ExtractedDecision, DecisionDomain, DecisionPriority } from '@groundwork/shared';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * SessionExtractor
 *
 * Extracts decisions made during a live AI coding session. Two modes:
 *
 *   1. Heuristic (default, no network): detects explicit decision language
 *      ("we'll use X", "let's go with Y", "decided to Z because...") and
 *      classifies domain/priority from keywords.
 *
 *   2. LLM (optional): if an OpenAI-compatible client is provided, uses it to
 *      extract structured decisions. Runs locally against the client the host
 *      provides — raw conversation never leaves the machine in the MVP unless
 *      the host explicitly wires a remote model.
 */
export class SessionExtractor {
  private llm?: LLMClient;

  constructor(llm?: LLMClient) {
    this.llm = llm;
  }

  async extract(messages: ConversationMessage[]): Promise<ExtractedDecision[]> {
    if (this.llm) {
      try {
        return await this.extractWithLLM(messages);
      } catch (err) {
        console.error('[SessionExtractor] LLM extraction failed, falling back to heuristics:', err);
      }
    }
    return this.extractHeuristic(messages);
  }

  /**
   * Detect the presence of a decision at all (Step 1 of the pipeline).
   */
  hasDecision(messages: ConversationMessage[]): boolean {
    const text = messages.map((m) => m.content).join('\n').toLowerCase();
    return SessionExtractor.DECISION_MARKERS.some((re) => re.test(text));
  }

  private static readonly DECISION_MARKERS: RegExp[] = [
    /\bwe'?ll use\b/i,
    /\blet'?s (?:use|go with)\b/i,
    /\bdecided to\b/i,
    /\bwe'?re going with\b/i,
    /\bswitch(?:ing)? to\b/i,
    /\bi'?ll use\b/i,
    /\buse (\w+) instead of\b/i,
    /\bstandardiz(?:e|ing) on\b/i,
  ];

  private static readonly DOMAIN_KEYWORDS: { domain: DecisionDomain; words: string[] }[] = [
    { domain: 'Database', words: ['database', 'postgres', 'mysql', 'mongodb', 'prisma', 'orm', 'sql', 'redis'] },
    { domain: 'Authentication', words: ['auth', 'jwt', 'oauth', 'login', 'session', 'token'] },
    { domain: 'API', words: ['api', 'rest', 'graphql', 'trpc', 'endpoint', 'route'] },
    { domain: 'Schema', words: ['schema', 'uuid', 'primary key', 'column', 'migration', 'table'] },
    { domain: 'Testing', words: ['test', 'jest', 'vitest', 'playwright', 'cypress', 'coverage'] },
    { domain: 'Infrastructure', words: ['deploy', 'docker', 'kubernetes', 'aws', 'vercel', 'cache'] },
    { domain: 'Security', words: ['bcrypt', 'argon2', 'encrypt', 'hash', 'secret', 'vulnerability'] },
    { domain: 'Framework', words: ['react', 'vue', 'angular', 'next', 'express', 'framework'] },
  ];

  private extractHeuristic(messages: ConversationMessage[]): ExtractedDecision[] {
    const decisions: ExtractedDecision[] = [];
    const seen = new Set<string>();

    for (const msg of messages) {
      const sentences = msg.content.split(/(?<=[.!?])\s+|\n+/);
      for (const sentence of sentences) {
        if (!SessionExtractor.DECISION_MARKERS.some((re) => re.test(sentence))) continue;

        const title = this.titleFromSentence(sentence);
        const key = title.toLowerCase();
        if (seen.has(key) || title.length < 8) continue;
        seen.add(key);

        const domain = this.classifyDomain(sentence);
        decisions.push({
          title,
          domain,
          priority: this.priorityForDomain(domain),
          confidence: 0.7,
          source: 'ai-session',
          rationale: this.extractRationale(sentence),
        });
      }
    }

    return decisions;
  }

  private titleFromSentence(sentence: string): string {
    let s = sentence.trim().replace(/\s+/g, ' ');
    // Trim rationale clause for the title
    s = s.replace(/\s+because\b.*$/i, '');
    // Capitalize
    s = s.charAt(0).toUpperCase() + s.slice(1);
    // Cap length
    return s.length > 120 ? s.slice(0, 117) + '...' : s;
  }

  private extractRationale(sentence: string): string | undefined {
    const m = sentence.match(/because\b(.*)$/i);
    return m ? m[1].trim().replace(/[.]+$/, '') : undefined;
  }

  private classifyDomain(text: string): DecisionDomain {
    const lower = text.toLowerCase();
    let best: { domain: DecisionDomain; hits: number } = { domain: 'Other', hits: 0 };
    for (const { domain, words } of SessionExtractor.DOMAIN_KEYWORDS) {
      const hits = words.filter((w) => lower.includes(w)).length;
      if (hits > best.hits) best = { domain, hits };
    }
    return best.domain;
  }

  private priorityForDomain(domain: DecisionDomain): DecisionPriority {
    const p0: DecisionDomain[] = ['Database', 'Authentication', 'API', 'Schema', 'Security'];
    const p1: DecisionDomain[] = ['Testing', 'Infrastructure', 'Framework'];
    if (p0.includes(domain)) return 'P0';
    if (p1.includes(domain)) return 'P1';
    return 'P2';
  }

  private async extractWithLLM(messages: ConversationMessage[]): Promise<ExtractedDecision[]> {
    const conversation = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
    const prompt = `You analyze developer/AI coding conversations and extract architectural DECISIONS.
Return a JSON array. Each item: {"title","domain","priority","rationale","alternatives"}.
- domain in [Schema,Authentication,API,Testing,Infrastructure,Framework,Database,Tooling,Security,Performance,Other]
- priority in [P0,P1,P2] (P0=critical constraints, P1=important patterns, P2=soft guidance)
Only include real decisions. If none, return [].

Conversation:
${conversation}`;

    const raw = await this.llm!.complete(prompt);
    const jsonStart = raw.indexOf('[');
    const jsonEnd = raw.lastIndexOf(']');
    if (jsonStart === -1 || jsonEnd === -1) return [];

    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    return parsed.map((d: any) => ({
      title: d.title,
      domain: d.domain || 'Other',
      priority: d.priority || 'P1',
      confidence: 0.8,
      source: 'ai-session',
      rationale: d.rationale,
      alternatives: d.alternatives,
    }));
  }
}

export interface LLMClient {
  complete(prompt: string): Promise<string>;
}
