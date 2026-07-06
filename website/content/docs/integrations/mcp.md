---
title: MCP tools
description: The four Groundwork MCP tools and when to use them.
order: 3
---

Groundwork connects through the **Model Context Protocol** — any MCP-compatible client works (Claude Code, Cursor, Windsurf, etc.).

## Tools

| Tool | Purpose |
|------|---------|
| `groundwork_get_decisions` | Inject decisions relevant to the current file/module. Call **before** writing code. |
| `groundwork_check_intent` | Verify a planned approach doesn't conflict. |
| `groundwork_record_decision` | Persist a decision from the session for teammates. |
| `groundwork_stats` | Summarize the decision graph. |

## Get config

```bash
groundwork connect
```

## Storage

Default: `.groundwork/decisions.json` (local JSON).

Team mode: set `DATABASE_URL` for Postgres + pgvector (see [Install](../getting-started/install)).
