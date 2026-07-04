# Technical Architecture

## System Overview

Groundwork is built as a distributed system with three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Machine                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AI Coding Tool (Claude Code, Cursor, etc.)            │ │
│  │                        ↕                                │ │
│  │  MCP Server (Groundwork Local Agent)                   │ │
│  │    • Session monitoring                                 │ │
│  │    • Decision extraction (local)                        │ │
│  │    • Conflict detection (local)                         │ │
│  │    • Decision injection                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↕                                    │
└─────────────────────────────────────────────────────────────┘
                          ↕ (Structured decisions only)
┌─────────────────────────────────────────────────────────────┐
│                   Groundwork Cloud                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Decision Graph Service                                 │ │
│  │    • Graph storage (PostgreSQL + pgvector)              │ │
│  │    • Relationship management                            │ │
│  │    • Conflict detection (cross-team)                    │ │
│  │    • Decision propagation                               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Layer                                              │ │
│  │    • GraphQL API for dashboard                          │ │
│  │    • WebSocket for real-time updates                    │ │
│  │    • REST API for GitHub Actions                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   GitHub / GitLab                            │
│  • GitHub Action (PR enforcement)                            │
│  • Commit hooks                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Deep Dive

### 1. MCP Server (Local Agent)

**Technology Stack:**
- Node.js / TypeScript
- MCP protocol implementation
- Local SQLite cache
- File system watcher

**Key Responsibilities:**

#### Session Monitoring
```typescript
interface SessionContext {
  sessionId: string;
  tool: 'claude-code' | 'cursor' | 'windsurf' | 'copilot';
  startTime: Date;
  currentFile?: string;
  currentModule?: string;
  conversationHistory: Message[];
}
```

Monitors active AI coding sessions through MCP protocol hooks:
- Tool startup/shutdown
- File context changes
- Message exchanges
- Code generation events

#### Decision Extraction Pipeline

**Four-Step Process:**

1. **Decision Detection**
   - Analyzes conversation for decision markers
   - Keywords: "we'll use", "decided to", "going with", "switching to"
   - Confidence scoring based on explicitness
   
2. **Decision Extraction**
   ```typescript
   interface ExtractedDecision {
     title: string;
     domain: DecisionDomain;
     rationale: string;
     alternatives: string[];
     affectedModules: string[];
     confidence: number; // 0.0 to 1.0
   }
   ```

3. **Classification**
   - Domain classification: Schema, Auth, API, Testing, Infrastructure, etc.
   - Priority assignment: P0 (critical), P1 (important), P2 (soft)
   - Relationship detection: DEPENDS_ON, CONSTRAINS, CONFLICTS_WITH

4. **Conflict Check**
   - Queries local decision cache
   - Performs semantic similarity search
   - Flags potential conflicts before sending to cloud

#### Injection Engine

**Relevance-Ranked Injection:**

```typescript
interface InjectionContext {
  currentFile: string;
  currentModule: string;
  firstMessage: string;
  recentFileHistory: string[];
}

function selectDecisionsToInject(
  context: InjectionContext,
  allDecisions: Decision[]
): Decision[] {
  // 1. Always inject P0 decisions in relevant domain
  const p0Decisions = allDecisions.filter(
    d => d.priority === 'P0' && 
         isRelevantDomain(d.domain, context)
  );
  
  // 2. Semantically rank P1 decisions
  const p1Ranked = semanticSearch(
    allDecisions.filter(d => d.priority === 'P1'),
    context.firstMessage
  );
  
  // 3. Compress and combine
  return compress([...p0Decisions, ...p1Ranked.slice(0, 10)]);
}
```

**Injection Timing:**
- At session start (before first AI response)
- Before each significant code generation
- After context window refresh

**Performance Target:** < 80ms injection latency

### 2. Decision Graph Service

**Data Model:**

```sql
-- Core decisions table
CREATE TABLE decisions (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  domain VARCHAR(50) NOT NULL,
  priority VARCHAR(10) NOT NULL,
  made_by VARCHAR(255),
  made_at TIMESTAMP NOT NULL,
  source VARCHAR(100),
  confidence FLOAT NOT NULL,
  status VARCHAR(20) NOT NULL,
  rationale TEXT,
  embedding VECTOR(1536), -- For semantic search
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Decision relationships
CREATE TABLE decision_relationships (
  id UUID PRIMARY KEY,
  source_decision_id UUID REFERENCES decisions(id),
  target_decision_id UUID REFERENCES decisions(id),
  relationship_type VARCHAR(50) NOT NULL,
  -- Types: DEPENDS_ON, CONSTRAINS, CONFLICTS_WITH, SUPERSEDES
  strength FLOAT, -- 0.0 to 1.0
  created_at TIMESTAMP DEFAULT NOW()
);

-- Decision affects (which modules/files)
CREATE TABLE decision_affects (
  id UUID PRIMARY KEY,
  decision_id UUID REFERENCES decisions(id),
  module_path TEXT NOT NULL,
  file_pattern TEXT,
  impact_level VARCHAR(20)
);

-- Injection history (for analytics)
CREATE TABLE injection_history (
  id UUID PRIMARY KEY,
  decision_id UUID REFERENCES decisions(id),
  session_id VARCHAR(255) NOT NULL,
  injected_at TIMESTAMP DEFAULT NOW(),
  developer_id VARCHAR(255)
);
```

**Graph Traversal:**

For V1 (MVP), we use PostgreSQL with recursive CTEs for relationship queries:

```sql
-- Find all decisions affected by changing decision X
WITH RECURSIVE affected AS (
  SELECT id, title, 1 as depth
  FROM decisions
  WHERE id = $decision_id
  
  UNION
  
  SELECT d.id, d.title, a.depth + 1
  FROM decisions d
  JOIN decision_relationships r ON r.target_decision_id = d.id
  JOIN affected a ON r.source_decision_id = a.id
  WHERE a.depth < 5 -- Max depth
)
SELECT * FROM affected;
```

For V2, migrate to Neo4j or similar graph database for better performance at scale.

**Semantic Search:**

Uses pgvector for embedding-based similarity:

```sql
-- Find decisions similar to current context
SELECT d.*, (1 - (d.embedding <=> $query_embedding)) as similarity
FROM decisions d
WHERE d.status = 'ACTIVE'
  AND (1 - (d.embedding <=> $query_embedding)) > 0.7
ORDER BY similarity DESC
LIMIT 20;
```

### 3. Extractors

**Extractor Interface:**

```typescript
interface Extractor {
  name: string;
  priority: number;
  
  canExtract(context: ExtractionContext): boolean;
  
  extract(context: ExtractionContext): Promise<ExtractedDecision[]>;
}
```

**Implemented Extractors (MVP):**

#### 1. Static File Extractor
```typescript
class StaticFileExtractor implements Extractor {
  supportedFiles = [
    'CLAUDE.md',
    'AGENTS.md',
    '.cursorrules',
    'ARCHITECTURE.md'
  ];
  
  async extract(context: ExtractionContext): Promise<ExtractedDecision[]> {
    const content = await readFile(context.filePath);
    const sections = parseMarkdownSections(content);
    
    return sections.map(section => ({
      title: inferDecisionTitle(section),
      domain: classifyDomain(section.content),
      priority: 'P0', // Static files are high-signal
      confidence: 0.95,
      source: context.filePath,
      rationale: section.content
    }));
  }
}
```

#### 2. Package Dependency Extractor
```typescript
class PackageDependencyExtractor implements Extractor {
  async extract(context: ExtractionContext): Promise<ExtractedDecision[]> {
    const pkg = JSON.parse(await readFile('package.json'));
    
    return Object.entries(pkg.dependencies).map(([name, version]) => ({
      title: `Using ${name} for ${inferPurpose(name)}`,
      domain: 'Tooling',
      priority: determinePriority(name), // Framework = P0, util = P1
      confidence: 0.88,
      source: 'package.json',
      metadata: { packageName: name, version }
    }));
  }
}
```

#### 3. Database Schema Extractor
```typescript
class SchemaExtractor implements Extractor {
  async extract(context: ExtractionContext): Promise<ExtractedDecision[]> {
    const schema = await parseSchema(context.schemaFile);
    const decisions: ExtractedDecision[] = [];
    
    // ID format decision
    const idFormats = detectIdFormats(schema);
    if (idFormats.primary) {
      decisions.push({
        title: `Primary keys use ${idFormats.primary} format`,
        domain: 'Schema',
        priority: 'P0',
        confidence: 0.92
      });
    }
    
    // Timestamp pattern
    if (hasCreatedUpdatedPattern(schema)) {
      decisions.push({
        title: 'All tables include created_at and updated_at timestamps',
        domain: 'Schema',
        priority: 'P1',
        confidence: 0.90
      });
    }
    
    // Soft delete pattern
    if (hasSoftDeletePattern(schema)) {
      decisions.push({
        title: 'Using soft delete pattern (deleted_at column)',
        domain: 'Schema',
        priority: 'P0',
        confidence: 0.93
      });
    }
    
    return decisions;
  }
}
```

#### 4. Session Conversation Extractor
```typescript
class ConversationExtractor implements Extractor {
  async extract(context: ExtractionContext): Promise<ExtractedDecision[]> {
    const { conversation } = context;
    
    // Use LLM to extract decisions
    const prompt = `
      Analyze this developer-AI conversation and extract any architectural 
      decisions that were made. For each decision, provide:
      - Clear title
      - Domain (Schema, Auth, API, Testing, etc.)
      - Rationale given
      - Alternatives considered
      - Priority level (P0/P1/P2)
      
      Conversation:
      ${conversation.map(m => `${m.role}: ${m.content}`).join('\n')}
    `;
    
    const response = await llm.generate(prompt);
    return parseDecisionsFromLLM(response);
  }
}
```

### 4. GitHub Action (PR Enforcement)

**Workflow File:**

```yaml
# .github/workflows/groundwork-check.yml
name: Groundwork Decision Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  check-decisions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Need full history for diff
      
      - name: Run Groundwork Check
        uses: groundwork/check-action@v1
        with:
          project-id: ${{ secrets.GROUNDWORK_PROJECT_ID }}
          api-key: ${{ secrets.GROUNDWORK_API_KEY }}
          fail-on-p0: true
          warn-on-p1: true
```

**Check Logic:**

```typescript
async function checkPR(prContext: PRContext): Promise<CheckResult> {
  const { baseBranch, headBranch, changedFiles } = prContext;
  
  // 1. Get diff
  const diff = await git.diff(baseBranch, headBranch);
  const changes = parseDiff(diff);
  
  // 2. Fetch active decisions for this project
  const decisions = await groundwork.getActiveDecisions(projectId);
  
  // 3. Analyze each change against decisions
  const violations: Violation[] = [];
  
  for (const change of changes) {
    const relevantDecisions = decisions.filter(d => 
      isRelevant(d, change.file, change.module)
    );
    
    for (const decision of relevantDecisions) {
      const violation = await checkViolation(change, decision);
      if (violation) {
        violations.push(violation);
      }
    }
  }
  
  // 4. Determine pass/fail
  const p0Violations = violations.filter(v => v.priority === 'P0');
  const p1Violations = violations.filter(v => v.priority === 'P1');
  
  return {
    passed: p0Violations.length === 0,
    p0Violations,
    p1Violations,
    summary: generateSummary(violations)
  };
}
```

**Violation Detection:**

```typescript
async function checkViolation(
  change: CodeChange,
  decision: Decision
): Promise<Violation | null> {
  // Extract semantic intent of the code change
  const changeIntent = await analyzeCodeSemantics(change.newCode);
  
  // Compare against decision requirement
  const decisionRequirement = decision.metadata.requirement;
  
  // Check for direct conflicts
  if (directlyConflicts(changeIntent, decisionRequirement)) {
    return {
      decision,
      change,
      type: 'DIRECT_CONFLICT',
      explanation: generateExplanation(change, decision)
    };
  }
  
  // Check for semantic conflicts (more subtle)
  const semanticConflict = await checkSemanticConflict(
    changeIntent,
    decisionRequirement
  );
  
  if (semanticConflict.confidence > 0.8) {
    return {
      decision,
      change,
      type: 'SEMANTIC_CONFLICT',
      confidence: semanticConflict.confidence,
      explanation: semanticConflict.explanation
    };
  }
  
  return null;
}
```

## Privacy & Security Architecture

### Data Flow

**What leaves the developer machine:**
```json
{
  "decisionId": "uuid",
  "title": "User IDs are UUID v4 strings",
  "domain": "Schema",
  "priority": "P0",
  "confidence": 0.97,
  "madeBy": "developer-id-hash",
  "madeAt": "2026-01-13T10:30:00Z",
  "source": "claude-code-session",
  "rationale": "Portable across microservices, no ordering leakage",
  "alternatives": ["Integer auto-increment", "ULID"],
  "affectedModules": ["auth", "billing", "api"]
}
```

**What NEVER leaves the developer machine:**
- Raw conversation content
- Source code
- File contents
- Environment variables
- API keys or secrets
- Personally identifiable information

### On-Premises Deployment

For Enterprise customers requiring complete data isolation:

```
┌─────────────────────────────────────────────────────────┐
│             Customer's Private Infrastructure            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Groundwork Cloud (self-hosted)                   │  │
│  │    • Decision Graph Service                        │  │
│  │    • API Layer                                     │  │
│  │    • Dashboard                                     │  │
│  │    • PostgreSQL database                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Developer Machines                                │  │
│  │    • MCP Servers connect to internal endpoint      │  │
│  │    • All data stays within customer network        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

Deployment options:
- Docker Compose (small teams)
- Kubernetes (larger deployments)
- AWS/Azure/GCP marketplace images

## Performance Targets

| Metric | Target | Measured At |
|--------|--------|-------------|
| Decision injection latency | < 80ms | MCP server |
| Conflict detection (local) | < 50ms | MCP server |
| Decision propagation time | < 60s | End-to-end |
| PR check completion | < 2min | GitHub Action |
| Dashboard load time | < 1s | Web frontend |
| API response time (p95) | < 200ms | Cloud API |

## Scalability Considerations

### V1 (MVP) - Target: 100 teams, 1000 developers
- Single PostgreSQL instance
- Simple horizontal scaling of API servers
- MCP servers are stateless (easy to scale)

### V2 - Target: 1000 teams, 10,000 developers
- PostgreSQL read replicas
- Redis caching layer
- Graph database (Neo4j) for relationship queries
- Message queue (RabbitMQ) for async processing

### V3 - Target: Enterprise scale
- Multi-region deployment
- Sharded graph database
- Event sourcing for decision history
- Dedicated customer instances (white-label)

## Technology Stack Summary

**MCP Server (Local Agent):**
- TypeScript/Node.js
- SQLite (local cache)
- Chokidar (file watching)
- OpenAI SDK (for extraction LLM)

**Cloud Backend:**
- Node.js/Express (API)
- PostgreSQL + pgvector (decision storage)
- GraphQL + WebSocket (real-time)
- Redis (caching, sessions)

**GitHub Action:**
- TypeScript
- @actions/core, @actions/github
- REST API client

**Dashboard:**
- React + TypeScript
- Apollo Client (GraphQL)
- TailwindCSS
- D3.js (decision graph visualization)

**Infrastructure:**
- AWS (primary)
- Docker + Kubernetes
- GitHub Actions (CI/CD)
- Terraform (IaC)
