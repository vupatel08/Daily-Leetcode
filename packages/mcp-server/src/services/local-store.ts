import { randomUUID } from 'crypto';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { Decision, ExtractedDecision, DecisionRelationship, RelationshipType } from '@groundwork/shared';
import { DecisionStore, DecisionStats } from './store';

interface LocalData {
  decisions: Decision[];
  injections: { decisionId: string; sessionId: string; developerId?: string; tool?: string; at: string }[];
  conflicts: { id: string; decision1Id: string; decision2Id: string; description: string; detectedAt: string; resolvedAt?: string }[];
  relationships: DecisionRelationship[];
}

/**
 * LocalStore
 *
 * File-backed implementation of DecisionStore. Persists to
 * `.groundwork/decisions.json` in the project. Requires no external
 * services, so it powers the CLI and CI use cases out of the box.
 */
export class LocalStore implements DecisionStore {
  private filePath: string;
  private data: LocalData = { decisions: [], injections: [], conflicts: [], relationships: [] };

  constructor(projectPath: string = process.cwd()) {
    this.filePath = join(projectPath, '.groundwork', 'decisions.json');
  }

  async init(): Promise<void> {
    if (existsSync(this.filePath)) {
      try {
        const raw = await readFile(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          decisions: (parsed.decisions || []).map(this.reviveDates),
          injections: parsed.injections || [],
          conflicts: parsed.conflicts || [],
          relationships: (parsed.relationships || []).map((r: any) => ({ ...r, createdAt: new Date(r.createdAt) })),
        };
      } catch {
        this.data = { decisions: [], injections: [], conflicts: [], relationships: [] };
      }
    } else {
      await mkdir(dirname(this.filePath), { recursive: true });
      await this.persist();
    }
  }

  async close(): Promise<void> {
    await this.persist();
  }

  private reviveDates(d: any): Decision {
    return {
      ...d,
      madeAt: new Date(d.madeAt),
      createdAt: new Date(d.createdAt),
      updatedAt: new Date(d.updatedAt),
    };
  }

  private async persist(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  async saveDecision(extracted: ExtractedDecision): Promise<Decision> {
    // Dedup by normalized title
    const key = extracted.title.toLowerCase().replace(/\s+/g, ' ').trim();
    const existing = this.data.decisions.find(
      (d) => d.title.toLowerCase().replace(/\s+/g, ' ').trim() === key
    );
    if (existing) {
      existing.confidence = Math.max(existing.confidence, extracted.confidence);
      existing.updatedAt = new Date();
      await this.persist();
      return existing;
    }

    const now = new Date();
    const decision: Decision = {
      id: randomUUID(),
      title: extracted.title,
      domain: extracted.domain,
      priority: extracted.priority,
      madeBy: (extracted.metadata?.madeBy as string) || undefined,
      madeAt: now,
      source: extracted.source,
      confidence: extracted.confidence,
      status: extracted.confidence >= 0.85 ? 'ACTIVE' : 'PROPOSED',
      rationale: extracted.rationale,
      alternatives: extracted.alternatives,
      affectedModules: extracted.affectedModules || [],
      metadata: extracted.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.data.decisions.push(decision);
    await this.persist();
    return decision;
  }

  async saveMany(decisions: ExtractedDecision[]): Promise<Decision[]> {
    const saved: Decision[] = [];
    for (const d of decisions) {
      saved.push(await this.saveDecision(d));
    }
    return saved;
  }

  async getActiveDecisions(): Promise<Decision[]> {
    return this.sortDecisions(this.data.decisions.filter((d) => d.status === 'ACTIVE'));
  }

  async getAllDecisions(): Promise<Decision[]> {
    return this.sortDecisions([...this.data.decisions]);
  }

  async getById(id: string): Promise<Decision | null> {
    return this.data.decisions.find((d) => d.id === id) || null;
  }

  async getByDomain(domain: string): Promise<Decision[]> {
    return this.sortDecisions(
      this.data.decisions.filter((d) => d.status === 'ACTIVE' && d.domain === domain)
    );
  }

  async getByModule(module: string): Promise<Decision[]> {
    return this.sortDecisions(
      this.data.decisions.filter(
        (d) => d.status === 'ACTIVE' && (d.affectedModules || []).includes(module)
      )
    );
  }

  async updateStatus(id: string, status: Decision['status']): Promise<void> {
    const decision = this.data.decisions.find((d) => d.id === id);
    if (decision) {
      decision.status = status;
      decision.updatedAt = new Date();
      await this.persist();
    }
  }

  async recordInjection(decisionId: string, sessionId: string, developerId?: string, tool?: string): Promise<void> {
    this.data.injections.push({ decisionId, sessionId, developerId, tool, at: new Date().toISOString() });
    await this.persist();
  }

  async saveConflict(decision1Id: string, decision2Id: string, description: string): Promise<void> {
    const exists = this.data.conflicts.find(
      (c) =>
        (c.decision1Id === decision1Id && c.decision2Id === decision2Id) ||
        (c.decision1Id === decision2Id && c.decision2Id === decision1Id)
    );
    if (exists) return;
    this.data.conflicts.push({
      id: randomUUID(),
      decision1Id,
      decision2Id,
      description,
      detectedAt: new Date().toISOString(),
    });
    await this.persist();
  }

  async getConflicts(): Promise<any[]> {
    return this.data.conflicts;
  }

  async saveRelationship(sourceId: string, targetId: string, type: RelationshipType): Promise<void> {
    if (sourceId === targetId) return;
    const exists = this.data.relationships.find(
      (r) => r.sourceId === sourceId && r.targetId === targetId && r.relationshipType === type
    );
    if (exists) return;
    this.data.relationships.push({
      id: randomUUID(),
      sourceId,
      targetId,
      relationshipType: type,
      createdAt: new Date(),
    });
    await this.persist();
  }

  async getRelationships(): Promise<DecisionRelationship[]> {
    return this.data.relationships;
  }

  async clearRelationships(): Promise<void> {
    this.data.relationships = [];
    await this.persist();
  }

  async getStats(): Promise<DecisionStats> {
    const byPriority: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const d of this.data.decisions) {
      byPriority[d.priority] = (byPriority[d.priority] || 0) + 1;
      byDomain[d.domain] = (byDomain[d.domain] || 0) + 1;
      byStatus[d.status] = (byStatus[d.status] || 0) + 1;
    }

    return { total: this.data.decisions.length, byPriority, byDomain, byStatus };
  }

  private sortDecisions(decisions: Decision[]): Decision[] {
    const order: Record<string, number> = { P0: 0, P1: 1, P2: 2 };
    return decisions.sort((a, b) => {
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      return b.madeAt.getTime() - a.madeAt.getTime();
    });
  }
}
