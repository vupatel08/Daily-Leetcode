import { ConflictDetector } from '../src/services/conflict-detector';
import { Decision, ExtractedDecision } from '@groundwork/shared';

function decision(partial: Partial<Decision>): Decision {
  const now = new Date();
  return {
    id: Math.random().toString(36).slice(2),
    title: 'Untitled',
    domain: 'Other',
    priority: 'P0',
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

describe('ConflictDetector', () => {
  const detector = new ConflictDetector();

  it('detects UUID vs integer ID conflict', () => {
    const existing = [decision({ title: 'Primary keys use UUID format', domain: 'Schema' })];
    const incoming: ExtractedDecision = {
      title: 'use integer auto-increment IDs',
      domain: 'Schema',
      priority: 'P0',
      confidence: 0.8,
      source: 'ai-session',
    };
    const conflicts = detector.detect(incoming, existing);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].description).toMatch(/primary key format/i);
  });

  it('does not flag agreeing decisions', () => {
    const existing = [decision({ title: 'Primary keys use UUID format', domain: 'Schema' })];
    const incoming: ExtractedDecision = {
      title: 'user ids should be uuid',
      domain: 'Schema',
      priority: 'P0',
      confidence: 0.8,
      source: 'ai-session',
    };
    expect(detector.detect(incoming, existing).length).toBe(0);
  });

  it('detects conflicting databases', () => {
    const existing = [decision({ title: 'Using PostgreSQL for data layer', domain: 'Database' })];
    const incoming: ExtractedDecision = {
      title: 'switch to MongoDB',
      domain: 'Database',
      priority: 'P0',
      confidence: 0.8,
      source: 'ai-session',
    };
    expect(detector.detect(incoming, existing).length).toBe(1);
  });

  it('treats postgres and postgresql as the same', () => {
    const existing = [decision({ title: 'Using PostgreSQL', domain: 'Database' })];
    const incoming: ExtractedDecision = {
      title: 'stick with postgres',
      domain: 'Database',
      priority: 'P0',
      confidence: 0.8,
      source: 'ai-session',
    };
    expect(detector.detect(incoming, existing).length).toBe(0);
  });

  it('finds conflicting pairs in a full graph', () => {
    const decisions = [
      decision({ title: 'REST API architecture', domain: 'API' }),
      decision({ title: 'GraphQL for API layer', domain: 'API' }),
    ];
    const pairs = detector.detectPairs(decisions);
    expect(pairs.length).toBe(1);
  });
});
