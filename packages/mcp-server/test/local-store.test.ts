import { LocalStore } from '../src/services/local-store';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('LocalStore', () => {
  let dir: string;
  let store: LocalStore;

  beforeEach(async () => {
    dir = mkdtempSync(join(tmpdir(), 'gw-store-'));
    store = new LocalStore(dir);
    await store.init();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('saves and lists decisions', async () => {
    await store.saveDecision({
      title: 'UUID ids',
      domain: 'Schema',
      priority: 'P0',
      confidence: 0.95,
      source: 'test',
    });
    const all = await store.getActiveDecisions();
    expect(all.length).toBe(1);
    expect(all[0].status).toBe('ACTIVE');
  });

  it('marks low-confidence decisions as PROPOSED', async () => {
    const d = await store.saveDecision({
      title: 'Maybe use X',
      domain: 'Other',
      priority: 'P2',
      confidence: 0.7,
      source: 'test',
    });
    expect(d.status).toBe('PROPOSED');
  });

  it('dedupes by normalized title', async () => {
    await store.saveDecision({ title: 'UUID ids', domain: 'Schema', priority: 'P0', confidence: 0.9, source: 'a' });
    await store.saveDecision({ title: 'uuid   ids', domain: 'Schema', priority: 'P0', confidence: 0.95, source: 'b' });
    const all = await store.getAllDecisions();
    expect(all.length).toBe(1);
  });

  it('persists across instances', async () => {
    await store.saveDecision({ title: 'Persisted', domain: 'Other', priority: 'P1', confidence: 0.9, source: 't' });
    await store.close();
    const store2 = new LocalStore(dir);
    await store2.init();
    const all = await store2.getAllDecisions();
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('Persisted');
  });

  it('computes stats', async () => {
    await store.saveDecision({ title: 'A', domain: 'Schema', priority: 'P0', confidence: 0.9, source: 't' });
    await store.saveDecision({ title: 'B', domain: 'API', priority: 'P1', confidence: 0.9, source: 't' });
    const stats = await store.getStats();
    expect(stats.total).toBe(2);
    expect(stats.byPriority.P0).toBe(1);
    expect(stats.byDomain.Schema).toBe(1);
  });
});
