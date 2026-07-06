---
title: What is Groundwork?
description: The decision layer that makes AI development work at team scale.
order: 1
---

Groundwork is **Layer 3** — invisible infrastructure underneath the AI coding tools your team already uses. It is not a chatbot. It is a living **decision graph** that:

1. **Scans** your repo on init (CLAUDE.md, Prisma, git, CI) — no cold start
2. **Captures** new decisions from AI sessions via MCP
3. **Propagates** active constraints to every developer's AI in real time
4. **Detects conflicts** when two decisions contradict each other
5. **Enforces** P0 violations on every pull request

The operative word is **automatic**. No one maintains a wiki. The graph is the source of truth.

<!-- visual:architecture-stack -->

<!-- visual:feature-pillars -->

## Quick start

```bash
npx @groundwork/cli init && groundwork connect
```

Then run `groundwork status` to see your decision graph.

## Next steps

- [Install](./install) — init, connect MCP, enforce on PRs
- [First session](./first-session) — what to expect
- [Decisions guide](../guides/decisions) — the core concept
