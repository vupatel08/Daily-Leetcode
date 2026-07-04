import { Pool } from 'pg';
import { Decision, ExtractedDecision, DecisionRelationship, RelationshipType } from '@groundwork/shared';
import { DecisionStore, DecisionStats } from './store';

/**
 * PostgresStore
 *
 * pg + pgvector backed implementation of DecisionStore for team/cloud
 * deployments. Mirrors LocalStore's behavior.
 */
export class PostgresStore implements DecisionStore {
  private pool: Pool;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString:
        connectionString ||
        process.env.DATABASE_URL ||
        'postgresql://groundwork:groundwork_dev@localhost:5432/groundwork',
    });
  }

  async init(): Promise<void> {
    const client = await this.pool.connect();
    client.release();
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async saveDecision(extracted: ExtractedDecision): Promise<Decision> {
    const status = extracted.confidence >= 0.85 ? 'ACTIVE' : 'PROPOSED';
    const query = `
      INSERT INTO decisions (
        title, domain, priority, source, confidence,
        rationale, alternatives, affected_modules, status, metadata
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`;
    const values = [
      extracted.title,
      extracted.domain,
      extracted.priority,
      extracted.source,
      extracted.confidence,
      extracted.rationale || null,
      extracted.alternatives || [],
      extracted.affectedModules || [],
      status,
      extracted.metadata || {},
    ];
    const result = await this.pool.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  async saveMany(decisions: ExtractedDecision[]): Promise<Decision[]> {
    const out: Decision[] = [];
    for (const d of decisions) out.push(await this.saveDecision(d));
    return out;
  }

  async getActiveDecisions(): Promise<Decision[]> {
    const r = await this.pool.query(
      `SELECT * FROM decisions WHERE status = 'ACTIVE' ORDER BY priority, made_at DESC`
    );
    return r.rows.map((row) => this.mapRow(row));
  }

  async getAllDecisions(): Promise<Decision[]> {
    const r = await this.pool.query(`SELECT * FROM decisions ORDER BY priority, made_at DESC`);
    return r.rows.map((row) => this.mapRow(row));
  }

  async getById(id: string): Promise<Decision | null> {
    const r = await this.pool.query(`SELECT * FROM decisions WHERE id = $1`, [id]);
    return r.rows[0] ? this.mapRow(r.rows[0]) : null;
  }

  async getByDomain(domain: string): Promise<Decision[]> {
    const r = await this.pool.query(
      `SELECT * FROM decisions WHERE status = 'ACTIVE' AND domain = $1 ORDER BY priority, made_at DESC`,
      [domain]
    );
    return r.rows.map((row) => this.mapRow(row));
  }

  async getByModule(module: string): Promise<Decision[]> {
    const r = await this.pool.query(
      `SELECT * FROM decisions WHERE status = 'ACTIVE' AND $1 = ANY(affected_modules) ORDER BY priority, made_at DESC`,
      [module]
    );
    return r.rows.map((row) => this.mapRow(row));
  }

  async updateStatus(id: string, status: Decision['status']): Promise<void> {
    await this.pool.query(`UPDATE decisions SET status = $1 WHERE id = $2`, [status, id]);
  }

  async recordInjection(decisionId: string, sessionId: string, developerId?: string, tool?: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO injection_history (decision_id, session_id, developer_id, tool) VALUES ($1,$2,$3,$4)`,
      [decisionId, sessionId, developerId, tool]
    );
  }

  async saveConflict(decision1Id: string, decision2Id: string, description: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO conflicts (decision1_id, decision2_id, description) VALUES ($1,$2,$3)`,
      [decision1Id, decision2Id, description]
    );
  }

  async getConflicts(): Promise<any[]> {
    const r = await this.pool.query(`SELECT * FROM conflicts WHERE resolved_at IS NULL ORDER BY detected_at DESC`);
    return r.rows;
  }

  async saveRelationship(sourceId: string, targetId: string, type: RelationshipType): Promise<void> {
    if (sourceId === targetId) return;
    await this.pool.query(
      `INSERT INTO decision_relationships (source_id, target_id, relationship_type)
       VALUES ($1,$2,$3)
       ON CONFLICT DO NOTHING`,
      [sourceId, targetId, type]
    );
  }

  async getRelationships(): Promise<DecisionRelationship[]> {
    const r = await this.pool.query(`SELECT * FROM decision_relationships`);
    return r.rows.map((row) => ({
      id: row.id,
      sourceId: row.source_id,
      targetId: row.target_id,
      relationshipType: row.relationship_type,
      strength: row.strength,
      createdAt: new Date(row.created_at),
    }));
  }

  async clearRelationships(): Promise<void> {
    await this.pool.query(`DELETE FROM decision_relationships`);
  }

  async getStats(): Promise<DecisionStats> {
    const [total, priority, domain, status] = await Promise.all([
      this.pool.query('SELECT COUNT(*) as count FROM decisions'),
      this.pool.query('SELECT priority, COUNT(*) as count FROM decisions GROUP BY priority'),
      this.pool.query('SELECT domain, COUNT(*) as count FROM decisions GROUP BY domain'),
      this.pool.query('SELECT status, COUNT(*) as count FROM decisions GROUP BY status'),
    ]);
    return {
      total: parseInt(total.rows[0].count, 10),
      byPriority: Object.fromEntries(priority.rows.map((r) => [r.priority, parseInt(r.count, 10)])),
      byDomain: Object.fromEntries(domain.rows.map((r) => [r.domain, parseInt(r.count, 10)])),
      byStatus: Object.fromEntries(status.rows.map((r) => [r.status, parseInt(r.count, 10)])),
    };
  }

  private mapRow(row: any): Decision {
    return {
      id: row.id,
      title: row.title,
      domain: row.domain,
      priority: row.priority,
      madeBy: row.made_by,
      madeAt: new Date(row.made_at),
      source: row.source,
      confidence: row.confidence,
      status: row.status,
      rationale: row.rationale,
      alternatives: row.alternatives,
      affectedModules: row.affected_modules,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
