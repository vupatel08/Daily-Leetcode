# Decision Graph — Core Data Structure

The decision graph is the heart of Groundwork. It is **not** a flat list of
rules — it is a network of decisions connected by typed relationships. This
document describes how it is modeled, built, stored, queried, and enforced in
the current implementation.

## Nodes: Decisions

Every node is a `Decision`:

```ts
interface Decision {
  id: string;
  title: string;
  domain: DecisionDomain;      // Schema | Authentication | API | Testing |
                               // Infrastructure | Framework | Database |
                               // Tooling | Security | Performance | Other
  priority: 'P0' | 'P1' | 'P2';
  madeBy?: string;
  madeAt: Date;
  source: string;              // e.g. CLAUDE.md, package.json, ai-session
  confidence: number;          // 0.0–1.0
  status: DecisionStatus;      // PROPOSED | ACTIVE | DISPUTED |
                               // SUPERSEDED | DEPRECATED
  rationale?: string;
  alternatives?: string[];
  affectedModules: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Priority

| Priority | Meaning | Injection | Enforcement |
|----------|---------|-----------|-------------|
| **P0** | Critical constraint (schema, auth, API contract) | Always, when relevant | Blocks PR merge |
| **P1** | Important pattern (conventions, tooling) | On domain/module match | Warns on PR |
| **P2** | Soft guidance (style) | On request | None |

### Lifecycle

```
PROPOSED  → confidence < 0.85, awaiting confirmation
ACTIVE    → enforced, injected, checked in PRs
DISPUTED  → a conflict was raised; paused until resolved
SUPERSEDED→ replaced by a newer decision (kept for history)
DEPRECATED→ no longer relevant (kept, not injected)
```

Decisions extracted at confidence ≥ `0.85` become `ACTIVE`; below that they
become `PROPOSED`. (Threshold configurable via `.groundwork/config.json`.)

## Edges: Relationships

Edges are typed and directed:

```ts
type RelationshipType = 'DEPENDS_ON' | 'CONSTRAINS' | 'CONFLICTS_WITH' | 'SUPERSEDES';

interface DecisionRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  strength?: number;
  createdAt: Date;
}
```

| Type | Meaning | Example |
|------|---------|---------|
| `CONSTRAINS` | A foundational choice limits a dependent one | `PostgreSQL → Prisma`, `Next.js → React` |
| `DEPENDS_ON` | A decision relies on another to make sense | `JWT auth → UUID user IDs` |
| `CONFLICTS_WITH` | Two decisions contradict each other | `UUID IDs ⚡ integer IDs` |
| `SUPERSEDES` | A newer decision refines/replaces an older one on the same subject | new `API style` → old `API style` |

## How edges are built

`RelationshipInferrer` (`packages/mcp-server/src/services/relationship-inferrer.ts`)
derives edges from the decisions themselves using conservative,
explainable rules:

- **CONSTRAINS** rules map a foundational term to a dependent term
  (database → ORM, ORM → query style, framework → UI/styling, language →
  tooling, auth provider → auth strategy). Word-boundary matching prevents
  false positives (e.g. `format` never matches `orm`).
- **DEPENDS_ON** rules connect decisions that reference each other
  (auth → ID format, payments → identity, hashing → auth strategy).
- **SUPERSEDES** groups ACTIVE decisions by a coarse "subject" (e.g.
  `schema:primary-key`) and links the newer to the older.
- **CONFLICTS_WITH** edges come from the `ConflictDetector` and are stored
  as conflict records; they are merged into the graph in `getGraph()`.

The graph is rebuilt after every scan/ingest via `Groundwork.buildGraph()`,
which clears and recomputes edges so the graph always reflects the current
set of ACTIVE decisions. Rebuilds are idempotent (no duplicate edges).

## Storage

The graph is persisted through the `DecisionStore` interface, with two
implementations:

- **LocalStore** — a JSON file at `.groundwork/decisions.json`
  (`{ decisions, relationships, conflicts, injections }`). Zero external
  dependencies; used by the CLI and CI.
- **PostgresStore** — `decisions` and `decision_relationships` tables with a
  `pgvector` column for semantic search. A unique constraint
  `(source_id, target_id, relationship_type)` keeps edges de-duplicated.

`createStore('auto')` uses Postgres when `DATABASE_URL` is set, else Local.

## Querying the graph

Via the engine:

```ts
const gw = new Groundwork({ projectPath });
await gw.init();
await gw.scanProject();          // extract + ingest + buildGraph

const graph = await gw.getGraph();      // { nodes, edges } for visualization
const timeline = await gw.getTimeline();// decisions newest-first
```

Via the API:

```
GET  /api/graph      -> { nodes: GraphNode[], edges: GraphEdge[] }
GET  /api/timeline   -> TimelineEntry[]
POST /api/graph/rebuild
```

The dashboard renders the graph as an interactive circular SVG (nodes colored
by priority, edges colored by relationship type, hover to trace connections)
and the timeline as a chronological feed.

## Why a graph and not a list

Relationships enable impact analysis that a flat list cannot:

> Changing `PostgreSQL → MongoDB` surfaces every decision that `CONSTRAINS`-
> depends on it (Prisma, UUID IDs, no-raw-SQL, …) so you see the blast radius
> before you make the change.

This is Groundwork's core data structure and its deepest moat: the graph gets
richer with every session, and that accumulated, connected knowledge is what
makes switching cost high.
