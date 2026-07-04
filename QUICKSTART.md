# Quickstart

Get Groundwork running on your project in a few minutes. No database
required for local use — everything works against a local JSON store.

## 1. Install & scan

```bash
# From the repo (workspace), build the packages:
npm install
npm run build --workspace=@groundwork/shared
npm run build --workspace=@groundwork/mcp-server
npm run build --workspace=@groundwork/cli

# Initialize Groundwork in any project (extracts decisions immediately):
node packages/cli/dist/cli.js init --path /path/to/your/project
```

You'll see something like:

```
✔ Groundwork initialized — extracted 28 decisions
Decision summary:
  Total:  28
  P0:     18
  P1:     8
  P2:     2
```

## 2. View the decision graph

```bash
# Text view
node packages/cli/dist/cli.js status --path /path/to/your/project

# Or the dashboard:
npm run build --workspace=@groundwork/api
PROJECT_PATH=/path/to/your/project node packages/api/dist/index.js
# open http://localhost:4000
```

## 3. Connect your AI tools (MCP)

```bash
node packages/cli/dist/cli.js connect
```

Add the printed config to your AI tool:

- **Claude Code**: `~/.config/claude/mcp.json`
- **Cursor**: `.cursor/mcp.json` in your project

```json
{
  "mcpServers": {
    "groundwork": { "command": "groundwork-mcp" }
  }
}
```

Now your AI can call:
- `groundwork_get_decisions` — inject relevant decisions before coding
- `groundwork_check_intent` — verify a plan doesn't conflict
- `groundwork_record_decision` — persist a decision for teammates
- `groundwork_stats` — summarize the graph

## 4. Enforce on pull requests

Copy `packages/github-action/workflow-template.yml` into your repo's
`.github/workflows/`. On each PR, Groundwork checks the diff against the
decision graph and blocks merges that violate a P0 decision.

## 5. Team mode (Postgres)

Set `DATABASE_URL` to switch from the local JSON store to Postgres +
pgvector (see `docker-compose.yml` and `database/schema.sql`):

```bash
docker-compose up -d
export DATABASE_URL=postgresql://groundwork:groundwork_dev@localhost:5432/groundwork
```

## Optional: Slack notifications

```bash
export GROUNDWORK_SLACK_WEBHOOK=https://hooks.slack.com/services/XXX
```

Conflicts and captured decisions will post to your channel.
