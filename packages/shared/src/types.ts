/**
 * Shared types for Groundwork
 */

export type DecisionPriority = 'P0' | 'P1' | 'P2';

export type DecisionStatus = 
  | 'PROPOSED'  // Extracted but needs approval
  | 'ACTIVE'    // Enforced and injected
  | 'DISPUTED'  // Conflict raised
  | 'SUPERSEDED' // Replaced by newer decision
  | 'DEPRECATED'; // No longer relevant

export type DecisionDomain = 
  | 'Schema'
  | 'Authentication'
  | 'API'
  | 'Testing'
  | 'Infrastructure'
  | 'Framework'
  | 'Database'
  | 'Tooling'
  | 'Security'
  | 'Performance'
  | 'Other';

export type RelationshipType = 
  | 'DEPENDS_ON'
  | 'CONSTRAINS'
  | 'CONFLICTS_WITH'
  | 'SUPERSEDES';

export interface Decision {
  id: string;
  title: string;
  domain: DecisionDomain;
  priority: DecisionPriority;
  madeBy?: string;
  madeAt: Date;
  source: string;
  confidence: number; // 0.0 to 1.0
  status: DecisionStatus;
  rationale?: string;
  alternatives?: string[];
  affectedModules: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DecisionRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  strength?: number; // 0.0 to 1.0
  createdAt: Date;
}

export interface ExtractedDecision {
  title: string;
  domain: DecisionDomain;
  priority: DecisionPriority;
  confidence: number;
  source: string;
  rationale?: string;
  alternatives?: string[];
  affectedModules?: string[];
  metadata?: Record<string, any>;
}

export interface SessionContext {
  sessionId: string;
  tool: 'claude-code' | 'cursor' | 'windsurf' | 'copilot' | 'other';
  startTime: Date;
  currentFile?: string;
  currentModule?: string;
  initialPrompt?: string;
}

export interface InjectionContext {
  currentFile: string;
  currentModule: string;
  firstMessage: string;
  recentFileHistory?: string[];
}

export interface Conflict {
  id: string;
  decision1: Decision;
  decision2: Decision;
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}
