import { DatabaseService } from './services/database';
import { ClaudeMdExtractor } from './extractors/claude-md-extractor';

/**
 * Groundwork MCP Server - Phase 1 Foundation
 * 
 * Currently implements:
 * - Database connection
 * - CLAUDE.md extraction
 * - Basic decision storage
 * 
 * Coming next:
 * - MCP protocol integration
 * - Real-time injection
 * - Conflict detection
 */
export class GroundworkMCPServer {
  private db: DatabaseService;
  private extractors: ClaudeMdExtractor[];

  constructor() {
    this.db = new DatabaseService();
    this.extractors = [new ClaudeMdExtractor()];
  }

  /**
   * Initialize: Scan project and extract decisions
   */
  async initialize(projectPath: string): Promise<void> {
    console.log('[Groundwork] Initializing...');
    
    // Connect to database
    await this.db.connect();
    
    // Run extractors
    const allDecisions = [];
    
    for (const extractor of this.extractors) {
      if (await extractor.canExtract(projectPath)) {
        const decisions = await extractor.extract(projectPath);
        allDecisions.push(...decisions);
      }
    }
    
    // Save to database
    for (const decision of allDecisions) {
      await this.db.saveDecision(decision);
    }
    
    console.log(`[Groundwork] Extracted ${allDecisions.length} decisions`);
    
    // Show stats
    const stats = await this.db.getStats();
    console.log('[Groundwork] Decision stats:', stats);
  }

  /**
   * Get all active decisions
   */
  async getDecisions(): Promise<any[]> {
    return await this.db.getActiveDecisions();
  }

  async stop(): Promise<void> {
    await this.db.disconnect();
    console.log('[Groundwork] Stopped');
  }
}

// Test extraction if run directly
if (require.main === module) {
  const server = new GroundworkMCPServer();
  const projectPath = process.argv[2] || process.cwd();
  
  server.initialize(projectPath)
    .then(async () => {
      console.log('\n[Groundwork] ✓ Initialization complete');
      const decisions = await server.getDecisions();
      console.log(`\n[Groundwork] Active decisions: ${decisions.length}`);
      decisions.slice(0, 5).forEach(d => {
        console.log(`  - [${d.priority}] ${d.title}`);
      });
      await server.stop();
    })
    .catch(error => {
      console.error('[Groundwork] Failed:', error);
      process.exit(1);
    });
}
