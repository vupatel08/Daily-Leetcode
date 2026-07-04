import { Decision, ExtractedDecision, DecisionRelationship, RelationshipType } from '@groundwork/shared';

export interface DecisionStats {
  total: number;
  byPriority: Record<string, number>;
  byDomain: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface GraphNode {
  id: string;
  title: string;
  domain: string;
  priority: string;
  status: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: RelationshipType;
}

export interface DecisionGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TimelineEntry {
  id: string;
  title: string;
  domain: string;
  priority: string;
  status: string;
  source: string;
  madeAt: string;
  kind: 'decision';
}

/**
 * DecisionStore is the storage abstraction used across Groundwork.
 * It has two implementations:
 *   - LocalStore   (JSON file, zero-dependency, great for local dev / CI)
 *   - PostgresStore (pg + pgvector, used in cloud / team deployments)
 */
export interface DecisionStore {
  init(): Promise<void>;
  close(): Promise<void>;

  saveDecision(decision: ExtractedDecision): Promise<Decision>;
  saveMany(decisions: ExtractedDecision[]): Promise<Decision[]>;

  getActiveDecisions(): Promise<Decision[]>;
  getAllDecisions(): Promise<Decision[]>;
  getById(id: string): Promise<Decision | null>;
  getByDomain(domain: string): Promise<Decision[]>;
  getByModule(module: string): Promise<Decision[]>;

  updateStatus(id: string, status: Decision['status']): Promise<void>;

  recordInjection(decisionId: string, sessionId: string, developerId?: string, tool?: string): Promise<void>;
  saveConflict(decision1Id: string, decision2Id: string, description: string): Promise<void>;
  getConflicts(): Promise<any[]>;

  // Relationship graph
  saveRelationship(sourceId: string, targetId: string, type: RelationshipType): Promise<void>;
  getRelationships(): Promise<DecisionRelationship[]>;
  clearRelationships(): Promise<void>;

  getStats(): Promise<DecisionStats>;
}
