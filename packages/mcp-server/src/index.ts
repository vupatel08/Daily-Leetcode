import { MCPServer } from '@modelcontextprotocol/sdk';
import { DecisionService } from './services/decision-service';
import { ExtractionPipeline } from './extraction/pipeline';
import { InjectionEngine } from './injection/engine';

/**
 * Groundwork MCP Server
 * 
 * Local agent that runs on developer's machine to:
 * - Monitor AI coding sessions
 * - Extract architectural decisions
 * - Inject relevant decisions into AI context
 * - Detect conflicts in real-time
 */
export class GroundworkMCPServer {
  private server: MCPServer;
  private decisionService: DecisionService;
  private extractionPipeline: ExtractionPipeline;
  private injectionEngine: InjectionEngine;

  constructor() {
    this.server = new MCPServer({
      name: 'groundwork',
      version: '0.1.0',
      description: 'Groundwork decision layer for AI coding tools'
    });

    this.decisionService = new DecisionService();
    this.extractionPipeline = new ExtractionPipeline();
    this.injectionEngine = new InjectionEngine(this.decisionService);

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Hook into session start
    this.server.on('session:start', async (session) => {
      console.log(`[Groundwork] Session started: ${session.id}`);
      
      const context = {
        file: session.context.currentFile,
        module: session.context.currentModule,
        firstMessage: session.context.initialPrompt,
      };

      // Get relevant decisions and inject
      const decisions = await this.decisionService.getRelevantDecisions(context);
      const injectionText = this.injectionEngine.formatForInjection(decisions);

      session.injectContext({
        type: 'system',
        content: injectionText,
        priority: 'high',
      });

      console.log(`[Groundwork] Injected ${decisions.length} decisions`);
    });

    // Hook into code generation
    this.server.on('generation:before', async (event) => {
      // Check for potential conflicts before code is generated
      const intent = event.plannedGeneration;
      const conflicts = await this.decisionService.checkConflicts(intent);

      if (conflicts.length > 0) {
        event.warn({
          title: 'Potential Decision Conflict',
          message: this.formatConflictWarning(conflicts),
          decisions: conflicts.map(c => c.decision),
        });
        console.log(`[Groundwork] Warned about ${conflicts.length} potential conflicts`);
      }
    });

    // Hook into session end
    this.server.on('session:end', async (session) => {
      console.log(`[Groundwork] Session ended: ${session.id}`);
      
      // Extract decisions from conversation
      const decisions = await this.extractionPipeline.extractFromSession(session);
      
      if (decisions.length > 0) {
        await this.decisionService.saveDecisions(decisions);
        console.log(`[Groundwork] Extracted ${decisions.length} decisions`);
      }
    });
  }

  private formatConflictWarning(conflicts: any[]): string {
    return conflicts.map(c => 
      `⚠️ ${c.description}\\n` +
      `   Conflicts with: ${c.decision.title} (${c.decision.madeBy}, ${c.decision.madeAt})`
    ).join('\\n\\n');
  }

  async start(): Promise<void> {
    await this.server.listen();
    console.log('[Groundwork] MCP Server started');
  }

  async stop(): Promise<void> {
    await this.server.close();
    console.log('[Groundwork] MCP Server stopped');
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new GroundworkMCPServer();
  
  server.start().catch(error => {
    console.error('[Groundwork] Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\\n[Groundwork] Shutting down...');
    await server.stop();
    process.exit(0);
  });
}
