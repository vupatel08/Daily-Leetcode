import { Groundwork } from '../src/groundwork';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function makeProject(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'gw-graph-'));
  for (const [path, content] of Object.entries(files)) {
    const full = join(dir, path);
    mkdirSync(join(full, '..'), { recursive: true });
    writeFileSync(full, content);
  }
  return dir;
}

describe('Groundwork graph + timeline', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeProject({
      'package.json': JSON.stringify({ dependencies: { next: '14', react: '18', '@prisma/client': '5' } }),
      'prisma/schema.prisma':
        'datasource db { provider = "postgresql" }\nmodel A { id String @id @default(uuid()) }',
    });
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('builds a graph with nodes and relationship edges after scan', async () => {
    const gw = new Groundwork({ projectPath: dir, store: 'local' });
    await gw.init();
    await gw.scanProject();
    const graph = await gw.getGraph();
    await gw.close();

    expect(graph.nodes.length).toBeGreaterThan(3);
    expect(graph.edges.length).toBeGreaterThan(0);
    // Expect at least one CONSTRAINS edge (postgres -> prisma, or next -> react)
    expect(graph.edges.some((e) => e.type === 'CONSTRAINS')).toBe(true);
  });

  it('persists relationships in the store', async () => {
    const gw = new Groundwork({ projectPath: dir, store: 'local' });
    await gw.init();
    await gw.scanProject();
    const rels = await gw.store.getRelationships();
    await gw.close();
    expect(rels.length).toBeGreaterThan(0);
  });

  it('rebuildGraph is idempotent (no duplicate edges)', async () => {
    const gw = new Groundwork({ projectPath: dir, store: 'local' });
    await gw.init();
    await gw.scanProject();
    const first = await gw.store.getRelationships();
    await gw.buildGraph();
    const second = await gw.store.getRelationships();
    await gw.close();
    expect(second.length).toBe(first.length);
  });

  it('returns a timeline sorted newest-first', async () => {
    const gw = new Groundwork({ projectPath: dir, store: 'local' });
    await gw.init();
    await gw.scanProject();
    const tl = await gw.getTimeline();
    await gw.close();
    expect(tl.length).toBeGreaterThan(0);
    for (let i = 1; i < tl.length; i++) {
      expect(new Date(tl[i - 1].madeAt).getTime()).toBeGreaterThanOrEqual(
        new Date(tl[i].madeAt).getTime()
      );
    }
  });
});
