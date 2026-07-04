import { Decision, ExtractedDecision, InjectionContext } from '@groundwork/shared';
import { DecisionStore } from './services/store';
import { createStore, StoreKind } from './services/store-factory';
import { ConflictDetector, PotentialConflict } from './services/conflict-detector';
import { ExtractionPipeline } from './extractors/pipeline';
import { InjectionEngine } from './injection/engine';
import { SessionExtractor, ConversationMessage, LLMClient } from './extraction/session-extractor';

export interface GroundworkOptions {
  projectPath?: string;
  store?: StoreKind;
  llm?: LLMClient;
  maxInjectedDecisions?: number;
}

/**
 * Groundwork
 *
 * The core engine tying together storage, extraction, injection and
 * conflict detection. Framework-agnostic so it can be driven by the CLI,
 * the MCP server, the cloud API, or tests.
 */
export class Groundwork {
  readonly store: DecisionStore;
  private pipeline: ExtractionPipeline;
  private injection: InjectionEngine;
  private session: SessionExtractor;
  private conflicts: ConflictDetector;
  private projectPath: string;

  constructor(options: GroundworkOptions = {}) {
    this.projectPath = options.projectPath || process.cwd();
    this.store = createStore(options.store || 'auto', this.projectPath);
    this.pipeline = new ExtractionPipeline();
    this.injection = new InjectionEngine(options.maxInjectedDecisions ?? 15);
    this.session = new SessionExtractor(options.llm);
    this.conflicts = new ConflictDetector();
  }

  async init(): Promise<void> {
    await this.store.init();
  }

  async close(): Promise<void> {
    await this.store.close();
  }

  /**
   * Scan the project with all extractors and persist decisions.
   * Returns the decisions that were saved.
   */
  async scanProject(): Promise<Decision[]> {
    const extracted = await this.pipeline.run(this.projectPath);
    return this.ingest(extracted);
  }

  /**
   * Ingest a batch of extracted decisions: run conflict detection against
   * the existing graph, persist, and record conflicts.
   */
  async ingest(extracted: ExtractedDecision[]): Promise<Decision[]> {
    const existing = await this.store.getActiveDecisions();
    const saved: Decision[] = [];

    for (const decision of extracted) {
      const conflicts = this.conflicts.detect(decision, existing);
      const savedDecision = await this.store.saveDecision(decision);
      saved.push(savedDecision);

      for (const conflict of conflicts) {
        await this.store.saveConflict(
          conflict.existing.id,
          savedDecision.id,
          conflict.description
        );
        // Mark both as disputed so neither is enforced until resolved
        await this.store.updateStatus(conflict.existing.id, 'DISPUTED');
        await this.store.updateStatus(savedDecision.id, 'DISPUTED');
      }
    }

    return saved;
  }

  /**
   * Build the injection block for a session context.
   */
  async buildInjection(context: InjectionContext, includeP2 = false): Promise<string> {
    const decisions = await this.store.getActiveDecisions();
    return this.injection.build(decisions, context, includeP2);
  }

  /**
   * Select decisions (without formatting) for a context.
   */
  async selectDecisions(context: InjectionContext, includeP2 = false): Promise<Decision[]> {
    const decisions = await this.store.getActiveDecisions();
    return this.injection.select(decisions, context, includeP2);
  }

  /**
   * Check an in-progress plan/intent against the graph for conflicts.
   */
  async checkIntent(intent: string): Promise<PotentialConflict[]> {
    const existing = await this.store.getActiveDecisions();
    const pseudo: ExtractedDecision = {
      title: intent,
      domain: 'Other',
      priority: 'P1',
      confidence: 0.5,
      source: 'intent-check',
    };
    return this.conflicts.detect(pseudo, existing);
  }

  /**
   * Process a finished AI session: extract decisions, ingest them.
   */
  async processSession(messages: ConversationMessage[]): Promise<Decision[]> {
    if (!this.session.hasDecision(messages)) return [];
    const extracted = await this.session.extract(messages);
    return this.ingest(extracted);
  }

  async getStats() {
    return this.store.getStats();
  }
}
