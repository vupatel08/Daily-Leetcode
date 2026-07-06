---
title: Dashboard
description: Local UI for decisions, graph, timeline, and conflicts.
order: 3
---

<!-- visual:codebase-dashboard -->

## Run locally

```bash
npm run build --workspace=@groundwork/api
PROJECT_PATH=/path/to/your/project node packages/api/dist/index.js
# open http://localhost:4000
```

## Tabs

- **Decisions** — filterable list with status and priority
- **Graph** — interactive relationship view
- **Timeline** — chronological feed
- **Conflicts** — open disputes

## Why it matters

See what your team decided, what's active, and what's blocking — without parsing JSON or CLI output.
