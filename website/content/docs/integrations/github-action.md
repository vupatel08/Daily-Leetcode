---
title: GitHub Action
description: Block PRs that violate P0 decisions.
order: 4
---

## Setup

Copy `packages/github-action/workflow-template.yml` into `.github/workflows/`:

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

## Behavior

- Reads added lines in the PR diff
- Checks against active decisions
- Posts a summary comment
- **Fails on P0 violations** — merge blocked
- Warns on P1 violations

<!-- visual:conflict-board -->
