---
title: Environment variables
description: GROUNDWORK_* and DATABASE_URL configuration.
order: 2
---

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | _(none)_ | Postgres connection — enables team mode |
| `PROJECT_PATH` | `cwd` | Project root for API dashboard |
| `GROUNDWORK_SLACK_WEBHOOK` | _(none)_ | Slack incoming webhook for conflicts |

## Examples

Team store with Docker:

```bash
docker-compose up -d
export DATABASE_URL=postgresql://groundwork:groundwork_dev@localhost:5432/groundwork
```

Slack notifications:

```bash
export GROUNDWORK_SLACK_WEBHOOK=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

Or in `.groundwork/config.json`:

```json
{ "slackWebhook": "https://hooks.slack.com/services/XXX/YYY/ZZZ" }
```
