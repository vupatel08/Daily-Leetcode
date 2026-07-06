---
title: CLI reference
description: groundwork init, scan, status, connect.
order: 1
---

```bash
groundwork init [--path <dir>]     # scan repo + write .groundwork/
groundwork scan [--path <dir>]     # re-scan after changes
groundwork status [--path <dir>]   # print decision graph
groundwork connect                 # print MCP config JSON
```

## MCP tools (via AI client)

```
groundwork_get_decisions
groundwork_check_intent
groundwork_record_decision
groundwork_stats
```

## Dashboard

```bash
npm run build --workspace=@groundwork/api
PROJECT_PATH=. node packages/api/dist/index.js
```
