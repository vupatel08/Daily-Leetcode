---
title: Cursor
description: Connect Groundwork via MCP in Cursor.
order: 2
---

## MCP config

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "groundwork": {
      "command": "groundwork-mcp"
    }
  }
}
```

Reload Cursor. Groundwork tools appear under MCP.

## Conflict catch

When a new extraction clashes with an active decision, Groundwork can surface a conflict before wrong code is committed — the scenario in our conflict-catch demo.

See [MCP tools](./mcp) for the full tool reference.
