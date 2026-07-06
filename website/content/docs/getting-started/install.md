---
title: Install
description: Initialize Groundwork, connect MCP, and wire PR enforcement.
order: 2
---

## From source (monorepo)

```bash
git clone https://github.com/vupatel08/Groudwork.git
cd Groudwork
npm install
npm run build --workspace=@groundwork/shared
npm run build --workspace=@groundwork/mcp-server
npm run build --workspace=@groundwork/cli
```

## Initialize your project

```bash
node packages/cli/dist/cli.js init --path /path/to/your/project
```

Or once published:

```bash
npx @groundwork/cli init
```

This scans CLAUDE.md, package.json, Prisma schemas, git history, and CI config — then writes `.groundwork/decisions.json`.

## Connect your AI tools

```bash
groundwork connect
```

Paste the MCP config into:

- **Claude Code:** `~/.config/claude/mcp.json`
- **Cursor:** `.cursor/mcp.json` in your project

## Team mode (Postgres)

```bash
docker-compose up -d
export DATABASE_URL=postgresql://groundwork:groundwork_dev@localhost:5432/groundwork
```

Groundwork auto-selects Postgres when `DATABASE_URL` is set.

## PR enforcement

Copy `packages/github-action/workflow-template.yml` to `.github/workflows/groundwork.yml`.

## Verify

```bash
groundwork status
```

<!-- visual:decision-graph-board -->
