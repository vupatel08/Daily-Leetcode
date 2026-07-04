# Integration Guide — How to Connect AI Tools

Groundwork connects to AI coding tools through the **Model Context Protocol
(MCP)**, the open standard supported by Claude Code, Cursor, and other tools.
This guide covers connecting your tools, PR enforcement, and notifications.

## Prerequisites

Build the packages (or install from npm once published):

```bash
npm install
npm run build --workspace=@groundwork/shared
npm run build --workspace=@groundwork/mcp-server
npm run build --workspace=@groundwork/cli
```

Initialize Groundwork in your project (this runs the first scan):

```bash
node packages/cli/dist/cli.js init --path /path/to/your/project
```

## 1. The MCP server

The MCP server is the bridge between your AI tool and the decision graph.
It runs locally over stdio and exposes four tools:

| Tool | Purpose |
|------|---------|
| `groundwork_get_decisions` | Inject the decisions relevant to the current file/module/request. Call **before** writing code. |
| `groundwork_check_intent` | Verify a planned approach doesn't conflict with a decision. |
| `groundwork_record_decision` | Persist a decision made during the session so teammates inherit it. |
| `groundwork_stats` | Summarize the decision graph. |

Run it directly (for debugging):

```bash
node packages/mcp-server/dist/index.js
# → [Groundwork] MCP server connected over stdio
```

Get the ready-to-paste config:

```bash
node packages/cli/dist/cli.js connect
```

## 2. Claude Code

Add Groundwork to your MCP config (typically `~/.config/claude/mcp.json`):

```json
{
  "mcpServers": {
    "groundwork": {
      "command": "groundwork-mcp"
    }
  }
}
```

If running from source instead of an installed binary:

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

Restart Claude Code. It will now see the `groundwork_*` tools and can pull
decisions into context before generating code.

## 3. Cursor

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

Reload Cursor. The tools appear under MCP and can be invoked automatically by
the agent or on demand.

## 4. Other MCP tools (Windsurf, etc.)

Any MCP-compatible client works. Point it at the `groundwork-mcp` command (or
`node .../mcp-server/dist/index.js`) over stdio. No tool-specific code is
required — that is the benefit of building on MCP.

## 5. Environment / storage

By default the server uses a local JSON store (`.groundwork/decisions.json`).
For team mode, set `DATABASE_URL` to use Postgres + pgvector:

```bash
docker-compose up -d
export DATABASE_URL=postgresql://groundwork:groundwork_dev@localhost:5432/groundwork
```

The server auto-selects Postgres when `DATABASE_URL` is present.

## 6. PR enforcement (GitHub Action)

Copy `packages/github-action/workflow-template.yml` into your repo's
`.github/workflows/`:

```yaml
name: Groundwork Decision Check
on:
  pull_request:
    types: [opened, synchronize, reopened]
permissions:
  contents: read
  pull-requests: write
jobs:
  groundwork:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: groundwork-dev/decision-check@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          fail-on-p0: true
```

On each PR the action reads the diff's added lines, checks them against the
active decisions, posts a single summary comment, and **fails on P0
violations**. See this repo's `.github/workflows/groundwork.yml` for a
build-from-source variant (dogfooding).

## 7. Slack notifications

Set a Slack Incoming Webhook and conflicts/decisions will post to your channel:

```bash
export GROUNDWORK_SLACK_WEBHOOK=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

Or in `.groundwork/config.json`:

```json
{ "slackWebhook": "https://hooks.slack.com/services/XXX/YYY/ZZZ" }
```

## 8. Dashboard

```bash
npm run build --workspace=@groundwork/api
PROJECT_PATH=/path/to/your/project node packages/api/dist/index.js
# open http://localhost:4000
```

Tabs: **Decisions** (filterable list), **Graph** (interactive relationship
graph), **Timeline** (chronological feed), **Conflicts**.

## Typical team workflow

1. One developer runs `groundwork init` and commits `.groundwork/` (or points
   the team at a shared Postgres).
2. Everyone adds the MCP config to their AI tool.
3. As people work, decisions are captured and propagated; conflicts are flagged
   in real time and in Slack.
4. The GitHub Action guards `main` — no P0 violation merges.
5. New teammates get the full decision graph injected from day one.
