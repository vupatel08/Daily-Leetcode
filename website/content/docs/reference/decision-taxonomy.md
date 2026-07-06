---
title: Decision taxonomy
description: P0/P1/P2 priorities and decision domains.
order: 3
---

<!-- visual:taxonomy-matrix -->

## Priority levels

| Priority | Injection | PR enforcement | Examples |
|----------|-----------|----------------|----------|
| **P0** | Always when relevant | **Blocks merge** | Schema, auth, API contracts |
| **P1** | Domain match | Warns | Tooling, conventions |
| **P2** | On request | None | Style guidance |

## Domains

Schema · Authentication · API · Testing · Infrastructure · Framework · Database · Tooling · Security · Performance · Other

## High conflict-risk areas

- Primary key format (UUID vs integer)
- ORM / database choice
- Auth contract (JWT shape, expiry)
- JSON naming (camelCase vs snake_case)
- Error response envelope

See `docs/DECISION_GRAPH.md` in the repo for the full model.
