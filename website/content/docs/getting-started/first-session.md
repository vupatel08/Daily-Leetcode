---
title: First session
description: What happens after init and MCP connect.
order: 3
---

After `groundwork init` and MCP connect, Groundwork runs automatically.

<!-- visual:session-flow -->

## Before you code

Your AI can call `groundwork_get_decisions` to pull active constraints for the current file or module.

<!-- visual:injection-preview -->

## While you work

- `groundwork_check_intent` — verify a plan won't conflict
- `groundwork_record_decision` — persist a decision for teammates
- Conflicts surface in real time and via Slack (optional webhook)

## After a session

Decisions propagate to the shared store. Teammates' AIs see updates on the next MCP call.

```bash
groundwork status
```

<!-- visual:decision-graph-board -->

## Sanity checklist

| Step | Command | Expected |
|------|---------|----------|
| Initialized | `groundwork status` | Decision list with P0/P1 counts |
| MCP wired | AI tool MCP panel | `groundwork_*` tools visible |
| Dashboard | `node packages/api/dist/index.js` | http://localhost:4000 |
| PR check | Open a PR | Groundwork Action comment |

## Next

- [Decisions guide](../guides/decisions)
- [GitHub Action](../integrations/github-action)
