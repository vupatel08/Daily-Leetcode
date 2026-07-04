/**
 * @groundwork/mcp-server
 *
 * Public entry point. Exports the core engine and MCP server, and when run
 * directly starts the MCP stdio server (used by Claude Code / Cursor).
 */
export { Groundwork } from './groundwork';
export type { GroundworkOptions } from './groundwork';
export { GroundworkMCPServer } from './mcp-server';
export { ExtractionPipeline } from './extractors/pipeline';
export { InjectionEngine } from './injection/engine';
export { ConflictDetector } from './services/conflict-detector';
export { SessionExtractor } from './extraction/session-extractor';
export { PRChecker } from './enforcement/pr-checker';
export type { FileChange, Violation, CheckResult } from './enforcement/pr-checker';
export { LocalStore } from './services/local-store';
export { PostgresStore } from './services/postgres-store';
export { createStore } from './services/store-factory';
export * from './extractors/pipeline';

import { GroundworkMCPServer } from './mcp-server';

if (require.main === module) {
  const server = new GroundworkMCPServer();
  server.start().catch((err) => {
    console.error('[Groundwork] Failed to start MCP server:', err);
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
}
