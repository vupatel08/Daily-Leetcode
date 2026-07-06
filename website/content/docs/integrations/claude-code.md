---
title: Claude Code
description: Connect Groundwork via MCP in Claude Code.
order: 1
---

## MCP config

Add to `~/.config/claude/mcp.json`:

```json
{
  "mcpServers": {
    "groundwork": {
      "command": "groundwork-mcp"
    }
  }
}
```

From source:

```json
{
  "mcpServers": {
    "groundwork": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"]
    }
  }
}
```

## Usage

Restart Claude Code. The agent can call `groundwork_get_decisions` before writing code and `groundwork_record_decision` after making architectural choices.

See [Integrations overview](./mcp) for all four MCP tools.
