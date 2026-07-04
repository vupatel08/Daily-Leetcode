import { SessionExtractor } from '../src/extraction/session-extractor';

describe('SessionExtractor', () => {
  const extractor = new SessionExtractor();

  it('detects presence of a decision', () => {
    expect(
      extractor.hasDecision([{ role: 'assistant', content: "We'll use Redis for caching." }])
    ).toBe(true);
    expect(
      extractor.hasDecision([{ role: 'user', content: 'How do I center a div?' }])
    ).toBe(false);
  });

  it('extracts a decision with rationale', async () => {
    const decisions = await extractor.extract([
      { role: 'user', content: 'How should we cache?' },
      {
        role: 'assistant',
        content: "We'll use Redis instead of in-memory caching because we need horizontal scaling.",
      },
    ]);
    expect(decisions.length).toBeGreaterThan(0);
    // Redis-for-caching is legitimately either Infrastructure or Database
    expect(['Infrastructure', 'Database']).toContain(decisions[0].domain);
    expect(decisions[0].rationale).toMatch(/horizontal scaling/i);
  });

  it('returns nothing for non-decision chatter', async () => {
    const decisions = await extractor.extract([
      { role: 'user', content: 'What is TypeScript?' },
      { role: 'assistant', content: 'It is a typed superset of JavaScript.' },
    ]);
    expect(decisions.length).toBe(0);
  });
});
