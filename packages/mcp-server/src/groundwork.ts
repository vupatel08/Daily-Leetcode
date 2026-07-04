import { Decision, ExtractedDecision, InjectionContext } from '@groundwork/shared';
import { DecisionStore, DecisionGraph, TimelineEntry } from './services/store';
import { createStore, StoreKind } from './services/store-factory';
import { ConflictDetector, PotentialConflict } from './services/conflict-detector';
import { RelationshipInferrer } from './services/relationship-inferrer';
import { ExtractionPipeline } from './extractors/pipeline';
import { InjectionEngine } from './injection/engine';
import { SessionExtractor, ConversationMessage, LLMClient } from './extraction/session-extractor';
import { Notifier, createNotifier } from './notifications/notifier';

export interface GroundworkOptions {
  projectPath?: string;
  store?: StoreKind;
  llm?: LLMClient;
  maxInjectedDecisions?: number;
  /** Slack webhook URL for conflict/decision notifications */
  slackWebhook?: string;
  /** Provide a custom notifier (overrides slackWebhook) */
  notifier?: Notifier;
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
  private relationships: RelationshipInferrer;
  private notifier: Notifier;
  private projectPath: string;

  constructor(options: GroundworkOptions = {}) {
    this.projectPath = options.projectPath || process.cwd();
    this.store = createStore(options.store || 'auto', this.projectPath);
    this.pipeline = new ExtractionPipeline();
    this.injection = new InjectionEngine(options.maxInjectedDecisions ?? 15);
    this.session = new SessionExtractor(options.llm);
    this.conflicts = new ConflictDetector();
    this.relationships = new RelationshipInferrer();
    this.notifier = options.notifier || createNotifier(options.slackWebhook);
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
    const saved = await this.ingest(extracted);
    await this.buildGraph();
    return saved;
  }

  /**
   * Recompute relationship edges across the active decisions and persist them.
   * Called after scans/ingests so the graph stays current.
   */
  async buildGraph(): Promise<number> {
    const decisions = await this.store.getActiveDecisions();
    const inferred = this.relationships.infer(decisions);
    await this.store.clearRelationships();
    for (const edge of inferred) {
      await this.store.saveRelationship(edge.sourceId, edge.targetId, edge.type);
    }
    return inferred.length;
  }

  /**
   * Return the full decision graph (nodes + edges) for visualization.
   */
  async getGraph(): Promise<DecisionGraph> {
    const decisions = await this.store.getAllDecisions();
    const relationships = await this.store.getRelationships();
    const conflicts = await this.store.getConflicts();

    const nodes = decisions.map((d) => ({
      id: d.id,
      title: d.title,
      domain: d.domain,
      priority: d.priority,
      status: d.status,
    }));

    const edges = relationships.map((r) => ({
      source: r.sourceId,
      target: r.targetId,
      type: r.relationshipType,
    }));

    // Include conflict edges so the graph shows contradictions too
    for (const c of conflicts) {
      edges.push({ source: c.decision1Id, target: c.decision2Id, type: 'CONFLICTS_WITH' as const });
    }

    return { nodes, edges };
  }

  /**
   * Return decisions ordered by when they were made, newest first.
   */
  async getTimeline(): Promise<TimelineEntry[]> {
    const decisions = await this.store.getAllDecisions();
    return decisions
      .slice()
      .sort((a, b) => b.madeAt.getTime() - a.madeAt.getTime())
      .map((d) => ({
        id: d.id,
        title: d.title,
        domain: d.domain,
        priority: d.priority,
        status: d.status,
        source: d.source,
        madeAt: d.madeAt.toISOString(),
        kind: 'decision' as const,
      }));
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
        await this.notifier.notifyConflict(
          conflict.description,
          `Existing: "${conflict.existing.title}" vs incoming: "${savedDecision.title}"`
        );
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
