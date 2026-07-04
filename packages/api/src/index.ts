import express, { Request, Response } from 'express';
import cors from 'cors';
import { join } from 'path';
import { Groundwork } from '@groundwork/mcp-server';

export interface ApiOptions {
  projectPath?: string;
  port?: number;
}

/**
 * createServer
 *
 * Builds the Groundwork API + dashboard server. REST endpoints expose the
 * decision graph; the dashboard (static SPA) is served from /public.
 */
export function createServer(options: ApiOptions = {}) {
  const app = express();
  const projectPath = options.projectPath || process.cwd();
  const engine = new Groundwork({ projectPath, store: 'auto' });
  let ready = engine.init();

  app.use(cors());
  app.use(express.json());

  const withEngine = (handler: (req: Request, res: Response) => Promise<void>) => {
    return async (req: Request, res: Response) => {
      try {
        await ready;
        await handler(req, res);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    };
  };

  // Health
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '0.1.0' }));

  // Stats
  app.get(
    '/api/stats',
    withEngine(async (_req, res) => {
      res.json(await engine.getStats());
    })
  );

  // List decisions (optional ?status=&domain=&priority=)
  app.get(
    '/api/decisions',
    withEngine(async (req, res) => {
      let decisions = await engine.store.getAllDecisions();
      const { status, domain, priority } = req.query;
      if (status) decisions = decisions.filter((d) => d.status === status);
      if (domain) decisions = decisions.filter((d) => d.domain === domain);
      if (priority) decisions = decisions.filter((d) => d.priority === priority);
      res.json(decisions);
    })
  );

  // Single decision
  app.get(
    '/api/decisions/:id',
    withEngine(async (req, res) => {
      const decision = await engine.store.getById(req.params.id);
      if (!decision) {
        res.status(404).json({ error: 'Decision not found' });
        return;
      }
      res.json(decision);
    })
  );

  // Create / ingest a decision
  app.post(
    '/api/decisions',
    withEngine(async (req, res) => {
      const body = req.body || {};
      if (!body.title) {
        res.status(400).json({ error: 'title is required' });
        return;
      }
      const saved = await engine.ingest([
        {
          title: body.title,
          domain: body.domain || 'Other',
          priority: body.priority || 'P1',
          confidence: body.confidence ?? 0.9,
          source: body.source || 'api',
          rationale: body.rationale,
          alternatives: body.alternatives,
          affectedModules: body.affectedModules,
        },
      ]);
      res.status(201).json(saved[0]);
    })
  );

  // Update decision status
  app.patch(
    '/api/decisions/:id',
    withEngine(async (req, res) => {
      const { status } = req.body || {};
      if (!status) {
        res.status(400).json({ error: 'status is required' });
        return;
      }
      await engine.store.updateStatus(req.params.id, status);
      res.json(await engine.store.getById(req.params.id));
    })
  );

  // Conflicts
  app.get(
    '/api/conflicts',
    withEngine(async (_req, res) => {
      res.json(await engine.store.getConflicts());
    })
  );

  // Injection preview
  app.post(
    '/api/inject',
    withEngine(async (req, res) => {
      const { currentFile = '', currentModule = '', firstMessage = '', includeGuidance = false } =
        req.body || {};
      const decisions = await engine.selectDecisions(
        { currentFile, currentModule, firstMessage },
        includeGuidance
      );
      const block = await engine.buildInjection(
        { currentFile, currentModule, firstMessage },
        includeGuidance
      );
      res.json({ decisions, block });
    })
  );

  // Trigger a project rescan
  app.post(
    '/api/scan',
    withEngine(async (_req, res) => {
      const decisions = await engine.scanProject();
      res.json({ scanned: decisions.length });
    })
  );

  // Serve dashboard
  app.use(express.static(join(__dirname, '..', 'public')));
  app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  return { app, engine };
}

if (require.main === module) {
  const port = parseInt(process.env.PORT || '4000', 10);
  const { app } = createServer({ port });
  app.listen(port, () => {
    console.log(`[Groundwork API] listening on http://localhost:${port}`);
  });
}
