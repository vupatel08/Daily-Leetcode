import { Pool, PoolClient } from 'pg';
import { Decision, DecisionRelationship, ExtractedDecision } from '@groundwork/shared';

export class DatabaseService {
  private pool: Pool;

  constructor(connectionString?: string) {
    this.pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL || 
        'postgresql://groundwork:groundwork_dev@localhost:5432/groundwork'
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('[Database] Connected successfully');
      client.release();
    } catch (error) {
      console.error('[Database] Connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    console.log('[Database] Disconnected');
  }

  /**
   * Save a new decision to the database
   */
  async saveDecision(extracted: ExtractedDecision): Promise<Decision> {
    const client = await this.pool.connect();
    
    try {
      const query = `
        INSERT INTO decisions (
          title, domain, priority, source, confidence,
          rationale, alternatives, affected_modules, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        extracted.title,
        extracted.domain,
        extracted.priority,
        extracted.source,
        extracted.confidence,
        extracted.rationale || null,
        extracted.alternatives || [],
        extracted.affectedModules || [],
        extracted.confidence >= 0.85 ? 'ACTIVE' : 'PROPOSED',
        extracted.metadata || {}
      ];

      const result = await client.query(query, values);
      console.log(`[Database] Saved decision: ${extracted.title}`);
      
      return this.mapRowToDecision(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Get all active decisions
   */
  async getActiveDecisions(): Promise<Decision[]> {
    const query = `
      SELECT * FROM decisions 
      WHERE status = 'ACTIVE' 
      ORDER BY priority, made_at DESC
    `;
    
    const result = await this.pool.query(query);
    return result.rows.map(row => this.mapRowToDecision(row));
  }

  /**
   * Get decisions by domain
   */
  async getDecisionsByDomain(domain: string): Promise<Decision[]> {
    const query = `
      SELECT * FROM decisions 
      WHERE status = 'ACTIVE' AND domain = $1
      ORDER BY priority, made_at DESC
    `;
    
    const result = await this.pool.query(query, [domain]);
    return result.rows.map(row => this.mapRowToDecision(row));
  }

  /**
   * Get decisions affecting a specific module
   */
  async getDecisionsByModule(module: string): Promise<Decision[]> {
    const query = `
      SELECT * FROM decisions 
      WHERE status = 'ACTIVE' 
        AND $1 = ANY(affected_modules)
      ORDER BY priority, made_at DESC
    `;
    
    const result = await this.pool.query(query, [module]);
    return result.rows.map(row => this.mapRowToDecision(row));
  }

  /**
   * Find similar decisions using semantic search (requires embeddings)
   */
  async findSimilarDecisions(embedding: number[], threshold: number = 0.7): Promise<Decision[]> {
    const query = `
      SELECT *, (1 - (embedding <=> $1::vector)) as similarity
      FROM decisions
      WHERE status = 'ACTIVE' 
        AND embedding IS NOT NULL
        AND (1 - (embedding <=> $1::vector)) > $2
      ORDER BY similarity DESC
      LIMIT 10
    `;
    
    const result = await this.pool.query(query, [JSON.stringify(embedding), threshold]);
    return result.rows.map(row => this.mapRowToDecision(row));
  }

  /**
   * Record that a decision was injected into an AI session
   */
  async recordInjection(decisionId: string, sessionId: string, developerId?: string, tool?: string): Promise<void> {
    const query = `
      INSERT INTO injection_history (decision_id, session_id, developer_id, tool)
      VALUES ($1, $2, $3, $4)
    `;
    
    await this.pool.query(query, [decisionId, sessionId, developerId, tool]);
  }

  /**
   * Get decision statistics
   */
  async getStats(): Promise<{
    total: number;
    byPriority: Record<string, number>;
    byDomain: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const totalQuery = 'SELECT COUNT(*) as count FROM decisions';
    const priorityQuery = 'SELECT priority, COUNT(*) as count FROM decisions GROUP BY priority';
    const domainQuery = 'SELECT domain, COUNT(*) as count FROM decisions GROUP BY domain';
    const statusQuery = 'SELECT status, COUNT(*) as count FROM decisions GROUP BY status';

    const [total, priority, domain, status] = await Promise.all([
      this.pool.query(totalQuery),
      this.pool.query(priorityQuery),
      this.pool.query(domainQuery),
      this.pool.query(statusQuery)
    ]);

    return {
      total: parseInt(total.rows[0].count),
      byPriority: Object.fromEntries(priority.rows.map(r => [r.priority, parseInt(r.count)])),
      byDomain: Object.fromEntries(domain.rows.map(r => [r.domain, parseInt(r.count)])),
      byStatus: Object.fromEntries(status.rows.map(r => [r.status, parseInt(r.count)]))
    };
  }

  /**
   * Helper to map database row to Decision type
   */
  private mapRowToDecision(row: any): Decision {
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
      updatedAt: new Date(row.updated_at)
    };
  }
}
