import { InjectionEngine } from '../src/injection/engine';
import { Decision } from '@groundwork/shared';

function decision(partial: Partial<Decision>): Decision {
  const now = new Date();
  return {
    id: Math.random().toString(36).slice(2),
    title: 'Untitled',
    domain: 'Other',
    priority: 'P1',
    madeAt: now,
    source: 'test',
    confidence: 0.9,
    status: 'ACTIVE',
    affectedModules: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

describe('InjectionEngine', () => {
  const engine = new InjectionEngine(5);

  it('always includes relevant P0 decisions', () => {
    const decisions = [
      decision({ title: 'UUID ids', priority: 'P0', domain: 'Schema', affectedModules: ['*'] }),
      decision({ title: 'Use Jest', priority: 'P1', domain: 'Testing', affectedModules: ['tests'] }),
    ];
    const selected = engine.select(decisions, {
      currentFile: 'src/models/user.ts',
      currentModule: 'models',
      firstMessage: 'add a field',
    });
    expect(selected.some((d) => d.title === 'UUID ids')).toBe(true);
  });

  it('excludes P2 unless requested', () => {
    const decisions = [
      decision({ title: 'Style pref', priority: 'P2', domain: 'Other', affectedModules: ['*'] }),
    ];
    const withoutP2 = engine.select(decisions, { currentFile: '', currentModule: '', firstMessage: '' });
    const withP2 = engine.select(decisions, { currentFile: '', currentModule: '', firstMessage: '' }, true);
    expect(withoutP2.length).toBe(0);
    expect(withP2.length).toBe(1);
  });

  it('ranks module-matching decisions higher', () => {
    const decisions = [
      decision({ title: 'Billing rule', priority: 'P1', domain: 'API', affectedModules: ['billing'] }),
      decision({ title: 'Random rule', priority: 'P1', domain: 'API', affectedModules: ['unrelated'] }),
    ];
    const selected = engine.select(decisions, {
      currentFile: 'src/billing/x.ts',
      currentModule: 'billing',
      firstMessage: 'work on billing',
    });
    expect(selected[0].title).toBe('Billing rule');
  });

  it('formats an injection block with priority sections', () => {
    const decisions = [decision({ title: 'UUID ids', priority: 'P0', domain: 'Schema', affectedModules: ['*'] })];
    const block = engine.build(decisions, { currentFile: '', currentModule: '', firstMessage: '' });
    expect(block).toContain('Team Architectural Decisions');
    expect(block).toContain('UUID ids');
  });

  it('returns empty string when nothing relevant', () => {
    expect(engine.build([], { currentFile: '', currentModule: '', firstMessage: '' })).toBe('');
  });
});
