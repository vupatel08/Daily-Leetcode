import { Groundwork } from './groundwork';

/**
 * Real ESM dynamic import from a CommonJS build.
 *
 * `@modelcontextprotocol/sdk` is ESM-only ("type": "module"). If we write a
 * literal `import('...')`, TypeScript (module: commonjs) down-levels it to
 * `require(...)`, which throws ERR_REQUIRE_ESM at runtime. Building the import
 * via `new Function` keeps it as a genuine runtime `import()` that Node loads
 * as ESM, and also stops `tsc` from trying to statically resolve the module's
 * types (which is fragile across environments). Types are intentionally `any`.
 */
const esmImport = new Function('specifier', 'return import(specifier);') as (
  specifier: string
) => Promise<any>;

/**
 * GroundworkMCPServer
 *
 * Exposes Groundwork to any MCP-compatible AI tool (Claude Code, Cursor, ...)
 * via a stdio transport.
 *
 * The @modelcontextprotocol/sdk is ESM-only, so it is loaded via dynamic
 * import() at runtime to remain compatible with our CommonJS build. All the
 * heavy lifting lives in the framework-agnostic `Groundwork` engine, which is
 * fully usable (and testable) without the SDK.
 *
 * Tools exposed:
 *   - groundwork_get_decisions: relevant decisions for the current context
 *   - groundwork_check_intent:  verify a planned approach vs the graph
 *   - groundwork_record_decision: persist a decision made this session
 *   - groundwork_stats: decision-graph summary
 */
export class GroundworkMCPServer {
  private engine: Groundwork;
  private server: any;

  constructor(engine?: Groundwork) {
    this.engine = engine || new Groundwork();
  }

  private toolDefinitions() {
    return [
      {
        name: 'groundwork_get_decisions',
        description:
          'Get the team architectural decisions relevant to what you are about to work on. ' +
          'Call this BEFORE writing code so you respect existing constraints.',
        inputSchema: {
          type: 'object',
          properties: {
            currentFile: { type: 'string', description: 'File being edited' },
            currentModule: { type: 'string', description: 'Module/domain being worked in' },
            firstMessage: { type: 'string', description: "The user's request" },
            includeGuidance: { type: 'boolean', description: 'Include low-priority P2 guidance' },
          },
        },
      },
      {
        name: 'groundwork_check_intent',
        description:
          'Check whether a planned approach conflicts with an existing team decision. ' +
          'Call this before committing to a technology or pattern.',
        inputSchema: {
          type: 'object',
          properties: {
            intent: {
              type: 'string',
              description: 'What you plan to do, e.g. "use integer IDs for users"',
            },
          },
          required: ['intent'],
        },
      },
      {
        name: 'groundwork_record_decision',
        description:
          'Record an architectural decision that was made during this session so teammates inherit it.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            domain: { type: 'string' },
            priority: { type: 'string', enum: ['P0', 'P1', 'P2'] },
            rationale: { type: 'string' },
          },
          required: ['title'],
        },
      },
      {
        name: 'groundwork_stats',
        description: 'Get a summary of the decision graph (counts by priority/domain/status).',
        inputSchema: { type: 'object', properties: {} },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<{ content: { type: string; text: string }[] }> {
    try {
      switch (name) {
        case 'groundwork_get_decisions': {
          const block = await this.engine.buildInjection(
            {
              currentFile: args.currentFile || '',
              currentModule: args.currentModule || '',
              firstMessage: args.firstMessage || '',
            },
            Boolean(args.includeGuidance)
          );
          return this.text(block || 'No relevant decisions recorded yet.');
        }
        case 'groundwork_check_intent': {
          const conflicts = await this.engine.checkIntent(args.intent || '');
          if (conflicts.length === 0) return this.text('✅ No conflicts with existing decisions.');
          const body = conflicts
            .map(
              (c) =>
                `⚠️ ${c.description}\n   Existing decision: "${c.existing.title}"` +
                (c.existing.madeBy ? ` (by ${c.existing.madeBy})` : '')
            )
            .join('\n\n');
          return this.text(`Potential conflicts detected:\n\n${body}`);
        }
        case 'groundwork_record_decision': {
          const saved = await this.engine.ingest([
            {
              title: args.title,
              domain: args.domain || 'Other',
              priority: args.priority || 'P1',
              confidence: 0.9,
              source: 'ai-session',
              rationale: args.rationale,
            },
          ]);
          return this.text(`Recorded decision: "${saved[0]?.title}" (${saved[0]?.status}).`);
        }
        case 'groundwork_stats': {
          const stats = await this.engine.getStats();
          return this.text(JSON.stringify(stats, null, 2));
        }
        default:
          return this.text(`Unknown tool: ${name}`);
      }
    } catch (err: any) {
      return this.text(`Groundwork error: ${err.message}`);
    }
  }

  private text(content: string) {
    return { content: [{ type: 'text', text: content }] };
  }

  async start(): Promise<void> {
    await this.engine.init();

    // Bridge the ESM-only SDK from our CommonJS build via a real dynamic import.
    const { Server } = await esmImport('@modelcontextprotocol/sdk/server/index.js');
    const { StdioServerTransport } = await esmImport('@modelcontextprotocol/sdk/server/stdio.js');
    const { CallToolRequestSchema, ListToolsRequestSchema } = await esmImport(
      '@modelcontextprotocol/sdk/types.js'
    );

    this.server = new Server(
      { name: 'groundwork', version: '0.1.0' },
      { capabilities: { tools: {} } }
    );

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.toolDefinitions(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;
      return this.handleToolCall(name, args || {});
    });

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Logs go to stderr so they don't corrupt the stdio JSON-RPC stream.
    console.error('[Groundwork] MCP server connected over stdio');
  }

  async stop(): Promise<void> {
    await this.engine.close();
  }
}
