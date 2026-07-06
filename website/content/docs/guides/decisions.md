---
title: Decisions
description: The decision graph — statuses, edges, and MCP tools.
order: 1
---

Decisions are the heart of Groundwork. Each node carries domain, priority, content, rationale, confidence, status, and typed edges.

<!-- visual:decision-graph-board -->

## Lifecycle

| Status | Meaning |
|--------|---------|
| PROPOSED | Confidence &lt; 0.85, awaiting confirmation |
| ACTIVE | Injected, enforced on PRs |
| DISPUTED | Conflict raised; paused until resolved |
| SUPERSEDED | Replaced by newer decision; history kept |
| DEPRECATED | No longer relevant |

<!-- visual:decision-timeline -->

## CLI

```bash
groundwork status
groundwork scan
```

<!-- visual:cli-decisions -->

## MCP tools

| Tool | When to call |
|------|--------------|
| `groundwork_get_decisions` | Before writing code |
| `groundwork_check_intent` | Before a risky change |
| `groundwork_record_decision` | After deciding something in session |
| `groundwork_stats` | Summarize the graph |

<!-- visual:injection-preview -->

## Graph edges

`CONFLICTS_WITH`, `SUPERSEDES`, `DEPENDS_ON`, `AFFECTS_MODULE`

<!-- visual:decision-graph-network -->

See also: [Conflicts](./conflicts), [Decision taxonomy](../reference/decision-taxonomy).
