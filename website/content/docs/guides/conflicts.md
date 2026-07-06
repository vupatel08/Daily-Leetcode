---
title: Conflicts
description: How Groundwork detects contradictions and what to do next.
order: 2
---

When a new decision contradicts an active one, both are flagged and surfaced for resolution.

<!-- visual:conflict-board -->

## Detection

1. **Exact domain + topic match**
2. **Semantic similarity** on decision content
3. **Logical contradiction** — mutually exclusive choices

Until resolved, neither conflicting decision injects as authoritative.

## Resolution

Update the graph via MCP or re-scan after fixing the codebase. For PR violations, fix the diff and push — the Action re-runs.

## PR enforcement

P0 violations **block merge**. See [GitHub Action](../integrations/github-action).
