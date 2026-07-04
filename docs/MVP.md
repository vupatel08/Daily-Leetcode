# MVP Specification

## Goal

Build and ship the minimum viable product that proves Groundwork's core value proposition:
- Automatic decision extraction from AI sessions
- Cross-developer decision propagation
- PR enforcement that blocks violations

**Success criteria:** 10 paying teams using Groundwork daily within 3 months of launch.

## Scope

### IN SCOPE (MVP)

#### 1. Three Extractors Only
- **CLAUDE.md / AGENTS.md reader** (highest signal)
- **package.json dependency scanner** (covers 90% of projects)
- **Prisma schema analyzer** (most popular Node.js ORM)

These three cover ~80% of critical decisions.

#### 2. Two AI Tool Integrations
- **Claude Code** (via MCP)
- **Cursor** (via MCP)

These two have the highest adoption among teams likely to pay.

#### 3. Core Decision Graph
- PostgreSQL + pgvector (no graph DB yet)
- Basic CRUD operations
- Simple relationship tracking (stored as foreign keys)
- Semantic search for injection relevance

#### 4. Basic Dashboard
- Decision list view (sortable, filterable)
- Conflict list view
- Timeline view (recent decisions)
- Single project only
- Read-only (no editing decisions in UI)

#### 5. GitHub Action PR Check
- P0 violation blocking (fail the check)
- P1 violation warnings (comment but don't block)
- Clear violation messages with links to decisions
- Single repository per check

#### 6. Slack Notifications
- Conflict detected → message to team channel
- P0 violation in PR → message with link
- New decision extracted → optional notification

### OUT OF SCOPE (Post-MVP)

❌ Windsurf, Copilot, other AI tool integrations  
❌ Graph database (Neo4j)  
❌ Coverage heatmap  
❌ Linear/Jira integration  
❌ Meeting transcript extraction  
❌ Multi-project dashboard  
❌ Decision editing in UI  
❌ GitLab support  
❌ On-premises deployment  
❌ SSO/SAML  
❌ Fine-tuned extraction model  

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

**Deliverables:**
- [ ] MCP server skeleton (TypeScript project)
- [ ] PostgreSQL schema for decisions
- [ ] Basic extractor interface
- [ ] CLAUDE.md extractor (first implementation)
- [ ] Local testing harness

**Tech stack setup:**
```bash
# MCP Server
npx create-typescript-app groundwork-mcp-server
npm install @modelcontextprotocol/sdk pg dotenv

# Database
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=dev \
  -e POSTGRES_DB=groundwork \
  ankane/pgvector
```

**Database schema:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  domain VARCHAR(50) NOT NULL,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('P0', 'P1', 'P2')),
  made_by VARCHAR(255),
  made_at TIMESTAMP NOT NULL DEFAULT NOW(),
  source VARCHAR(100),
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  rationale TEXT,
  alternatives TEXT[],
  affected_modules TEXT[],
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE decision_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  target_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_decisions_status ON decisions(status);
CREATE INDEX idx_decisions_domain ON decisions(domain);
CREATE INDEX idx_decisions_priority ON decisions(priority);
CREATE INDEX idx_decisions_embedding ON decisions USING ivfflat (embedding vector_cosine_ops);
```

### Phase 2: Extraction Pipeline (Weeks 2-3)

**Deliverables:**
- [ ] package.json extractor
- [ ] Prisma schema extractor
- [ ] Confidence scoring system
- [ ] Decision deduplication logic
- [ ] Unit tests for all extractors

**Example: package.json extractor**
```typescript
// src/extractors/package-json-extractor.ts
import { Extractor, ExtractedDecision } from './types';
import { readFile } from 'fs/promises';
import { join } from 'path';

export class PackageJsonExtractor implements Extractor {
  name = 'package-json';
  priority = 90; // High priority

  async canExtract(projectPath: string): Promise<boolean> {
    try {
      await readFile(join(projectPath, 'package.json'));
      return true;
    } catch {
      return false;
    }
  }

  async extract(projectPath: string): Promise<ExtractedDecision[]> {
    const content = await readFile(join(projectPath, 'package.json'), 'utf-8');
    const pkg = JSON.parse(content);
    
    const decisions: ExtractedDecision[] = [];

    // Extract framework decisions
    const frameworks = ['next', 'react', 'vue', 'angular', 'express', 'fastify'];
    for (const fw of frameworks) {
      if (pkg.dependencies?.[fw] || pkg.dependencies?.[`@${fw}/core`]) {
        decisions.push({
          title: `Using ${fw} as primary framework`,
          domain: 'Framework',
          priority: 'P0',
          confidence: 0.95,
          source: 'package.json',
          rationale: `${fw} listed as dependency`,
          affectedModules: ['*'], // All modules
        });
      }
    }

    // Extract ORM/database decisions
    const orms = {
      'prisma': 'Prisma ORM',
      'typeorm': 'TypeORM',
      'sequelize': 'Sequelize',
      'mongoose': 'Mongoose (MongoDB)',
    };
    
    for (const [pkg, name] of Object.entries(orms)) {
      if (pkg.dependencies?.[pkg]) {
        decisions.push({
          title: `Using ${name} for database access`,
          domain: 'Database',
          priority: 'P0',
          confidence: 0.92,
          source: 'package.json',
        });
      }
    }

    // Extract testing framework
    const testFrameworks = ['jest', 'vitest', 'mocha', 'playwright', 'cypress'];
    for (const fw of testFrameworks) {
      if (pkg.devDependencies?.[fw]) {
        decisions.push({
          title: `Using ${fw} for testing`,
          domain: 'Testing',
          priority: 'P1',
          confidence: 0.88,
          source: 'package.json',
        });
      }
    }

    return decisions;
  }
}
```

### Phase 3: Injection System (Week 3-4)

**Deliverables:**
- [ ] MCP protocol integration
- [ ] Injection trigger on session start
- [ ] Relevance ranking algorithm
- [ ] Injection formatter (converts decisions to text)
- [ ] Latency optimization (< 80ms target)

**MCP Integration:**
```typescript
// src/mcp/server.ts
import { MCPServer } from '@modelcontextprotocol/sdk';

export class GroundworkMCPServer {
  private server: MCPServer;
  private decisionService: DecisionService;

  constructor() {
    this.server = new MCPServer({
      name: 'groundwork',
      version: '0.1.0',
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    // Hook into session start
    this.server.on('session:start', async (session) => {
      const context = {
        file: session.context.currentFile,
        module: session.context.currentModule,
        firstMessage: session.context.initialPrompt,
      };

      const decisions = await this.decisionService.getRelevantDecisions(context);
      const injectionText = formatDecisionsForInjection(decisions);

      // Inject into AI context
      session.injectContext({
        type: 'system',
        content: injectionText,
        priority: 'high',
      });
    });

    // Hook into code generation
    this.server.on('generation:before', async (event) => {
      // Check for potential conflicts before code is generated
      const intent = event.plannedGeneration;
      const conflicts = await this.decisionService.checkConflicts(intent);

      if (conflicts.length > 0) {
        event.warn({
          title: 'Potential Decision Conflict',
          message: formatConflictWarning(conflicts),
          decisions: conflicts.map(c => c.decision),
        });
      }
    });
  }

  async start() {
    await this.server.listen();
  }
}
```

### Phase 4: Dashboard (Week 4-5)

**Deliverables:**
- [ ] React app with TailwindCSS
- [ ] GraphQL API backend
- [ ] Decision list page
- [ ] Conflict list page
- [ ] Timeline view
- [ ] Basic auth (email/password)

**Tech stack:**
```bash
npx create-react-app groundwork-dashboard --template typescript
cd groundwork-dashboard
npm install @apollo/client graphql tailwindcss
npm install -D @types/react-router-dom
```

**Minimal GraphQL schema:**
```graphql
type Decision {
  id: ID!
  title: String!
  domain: String!
  priority: Priority!
  madeBy: String
  madeAt: DateTime!
  source: String!
  confidence: Float!
  status: DecisionStatus!
  rationale: String
  alternatives: [String!]
  affectedModules: [String!]
  relationships: [DecisionRelationship!]
  injectionCount: Int!
}

enum Priority {
  P0
  P1
  P2
}

enum DecisionStatus {
  PROPOSED
  ACTIVE
  DISPUTED
  SUPERSEDED
  DEPRECATED
}

type DecisionRelationship {
  target: Decision!
  type: RelationshipType!
}

enum RelationshipType {
  DEPENDS_ON
  CONSTRAINS
  CONFLICTS_WITH
  SUPERSEDES
}

type Query {
  decisions(
    status: DecisionStatus
    domain: String
    priority: Priority
  ): [Decision!]!
  
  decision(id: ID!): Decision
  
  conflicts: [Conflict!]!
}

type Conflict {
  id: ID!
  decision1: Decision!
  decision2: Decision!
  detectedAt: DateTime!
  resolvedAt: DateTime
  resolution: String
}
```

### Phase 5: GitHub Action (Week 5-6)

**Deliverables:**
- [ ] GitHub Action implementation
- [ ] PR diff analysis
- [ ] Violation detection logic
- [ ] Comment generation
- [ ] Status check posting

**Action implementation:**
```typescript
// action/src/main.ts
import * as core from '@actions/core';
import * as github from '@actions/github';
import { GroundworkClient } from './client';

async function run() {
  try {
    const projectId = core.getInput('project-id', { required: true });
    const apiKey = core.getInput('api-key', { required: true });
    const failOnP0 = core.getBooleanInput('fail-on-p0');
    
    const client = new GroundworkClient(apiKey);
    const context = github.context;
    
    if (context.eventName !== 'pull_request') {
      core.info('Not a pull request, skipping');
      return;
    }

    const pr = context.payload.pull_request!;
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN!);

    // Get PR diff
    const { data: files } = await octokit.rest.pulls.listFiles({
      ...context.repo,
      pull_number: pr.number,
    });

    // Check against decisions
    const result = await client.checkPR({
      projectId,
      baseSha: pr.base.sha,
      headSha: pr.head.sha,
      changedFiles: files,
    });

    // Post results
    const commentBody = formatCheckResult(result);
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pr.number,
      body: commentBody,
    });

    // Set check status
    if (result.p0Violations.length > 0 && failOnP0) {
      core.setFailed(`Found ${result.p0Violations.length} P0 violations`);
    } else {
      core.info('✅ No blocking violations found');
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
```

### Phase 6: Integration & Polish (Week 6-7)

**Deliverables:**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Error handling and logging
- [ ] Documentation (setup guide, API docs)
- [ ] Demo video
- [ ] Landing page

### Phase 7: Beta Testing (Week 7-8)

**Deliverables:**
- [ ] Recruit 5-10 beta teams
- [ ] Setup on their projects
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Iterate on UX

## Success Metrics

### Technical Metrics
- [ ] Extraction precision > 85% (decisions extracted are real decisions)
- [ ] Injection latency < 80ms
- [ ] PR check completion < 2min
- [ ] Zero data leaks in security audit

### Product Metrics
- [ ] 10+ decisions extracted on first scan for typical project
- [ ] At least 1 conflict detected per team per week (proves value)
- [ ] 90%+ of P0 violations correctly identified
- [ ] < 5% false positive rate on violations

### Business Metrics
- [ ] 10 paying teams within 3 months
- [ ] < 10% monthly churn
- [ ] At least 3 teams expand from Free to Team tier
- [ ] 50+ signups to waiting list before launch

## Launch Checklist

### Pre-Launch
- [ ] MCP server published to npm
- [ ] GitHub Action published to marketplace
- [ ] Dashboard deployed and accessible
- [ ] Documentation complete and published
- [ ] Pricing page live
- [ ] Stripe integration for billing
- [ ] Support email setup (hello@groundwork.dev)
- [ ] Status page setup

### Launch Day
- [ ] Blog post published
- [ ] Tweet thread from founder account
- [ ] Post on Hacker News
- [ ] Post on r/programming
- [ ] Announce in relevant Discord servers (Cursor, Claude)
- [ ] Email beta testers
- [ ] Update GitHub README

### Post-Launch (Week 1)
- [ ] Monitor for bugs and crashes
- [ ] Respond to all support emails within 4 hours
- [ ] Collect feedback from first 20 users
- [ ] Publish "first week metrics" post
- [ ] Start outreach to YC companies

## Timeline Summary

| Week | Phase | Key Milestone |
|------|-------|---------------|
| 1-2 | Foundation | Database schema + first extractor working |
| 2-3 | Extraction | All three extractors shipping decisions |
| 3-4 | Injection | MCP server injecting into Claude Code |
| 4-5 | Dashboard | Basic UI showing decisions |
| 5-6 | GitHub Action | PR checks blocking violations |
| 6-7 | Integration | Everything working end-to-end |
| 7-8 | Beta | Real teams using it |
| 9 | Launch | Public release |

**Total: 8-9 weeks from start to public launch**

## Team Requirements

**Minimum team:**
- 1 senior backend engineer (MCP server, API, database)
- 1 frontend engineer (dashboard)
- 1 DevOps/infra (deployment, monitoring)
- 1 founder (product, sales, support)

**Accelerated timeline (6 weeks):**
- 2 senior full-stack engineers
- 1 founder

## Budget (If Bootstrapped)

| Item | Cost |
|------|------|
| AWS infrastructure (dev) | $100/mo |
| OpenAI API (for extraction) | $200/mo |
| Domain + hosting | $50/mo |
| Design tools (Figma) | $15/mo |
| Monitoring (Sentry, LogRocket) | $50/mo |
| **Total monthly** | **~$415** |

**One-time:**
- Legal (LLC formation) | $500
- Logo design | $200

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| MCP protocol changes | Monitor @modelcontextprotocol releases, maintain backwards compatibility |
| Low extraction accuracy | Start with high-confidence extractors only, tune thresholds based on feedback |
| Performance issues | Profile early, optimize hot paths, consider caching |
| No one wants to pay | Validate with 10 teams willing to pay before building enforcement |
| Competition launches first | Focus on best execution, not first to market |

## Post-MVP Roadmap Preview

**V2 (Months 4-6):**
- More AI tool integrations (Windsurf, Copilot)
- Graph database migration
- Coverage heatmap
- Linear/Jira integration

**V3 (Months 7-12):**
- On-premises deployment
- Enterprise features (SSO, SAML)
- Fine-tuned extraction model
- OpenSpec deep integration

**V4 (Year 2):**
- Cross-repo governance
- Decision impact analysis
- AI-assisted conflict resolution
- Public templates marketplace
