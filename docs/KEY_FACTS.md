# Key Facts and Statistics

## Industry Context (2026)

### AI Coding Tool Adoption
- **85%** of developers use AI coding tools regularly
- **87%** of Fortune 500 companies use AI coding platforms
- **26 million** developers use GitHub Copilot globally
- **18%** enterprise adoption for Cursor and Claude Code (growing rapidly)
- **25%** of YC W25 batch: codebases 95% AI-generated

### Documented Problems
- **110,000+** AI-introduced issues found in production repos (arXiv, Feb 2026)
- **4x** increase in code duplication with AI adoption (GitClear, 211M lines studied)
- **48%** increase in copy-paste instances
- **60%** decrease in refactoring
- **45%** of AI-generated code contains security vulnerabilities (Veracode)
- **41%** increase in code complexity (CMU study on Cursor adoption)
- **30%** increase in static analysis warnings

### Team-Scale Impact
- At **15+ developers**, AI productivity gains compress to just **31%**
- Reason: Coordination overhead and review becomes the bottleneck
- Teams hit "**three-month wall**" where codebase becomes unmaintainable

## SDD Movement (2026)

### Adoption
- **50%+** of Fortune 1000 companies have active SDD pipelines (April 2026)
- **100,000+** developers adopted SDD in first 5 days of tool previews (March 2026)

### Performance Improvements
- **3-10x** higher first-pass success rate with SDD vs vibe coding
- **150%** speed gain (Mercari ASSD study)
- **50%** time reduction (Google migrations)
- **40-hour features** shipped in **under 8 hours** (AWS Kiro)
- **10x** fewer "regenerate from scratch" cycles (GitHub)

### Documented Gap
> "SDD's unsolved problem is governance at scale: specs are behavior-determining artifacts, and at fleet scale they need what code got decades ago — versions, owners, review, and a link from spec version to deployed behavior."
> — TrueFoundry SDD Governance Paper, 2026

## Market Size

### Addressable Market
- **~27 million** professional software developers globally
- **~4 million** in teams of 5-50 at companies actively using AI tools
- **Average team size**: 12 developers
- **TAM**: ~$14.4 billion annually (at $299/month per team)
- **Market growth**: ~50% YoY as AI tool adoption accelerates

### Pricing Benchmarks
- **Team tier**: $299/month (up to 15 developers)
- **Growth tier**: $799/month (up to 50 developers)
- **Enterprise**: From $50,000/year (unlimited developers)

## Groundwork Target Metrics

### Technical Performance
- **< 60 seconds**: Decision propagation time
- **< 80ms**: Injection latency
- **< 2 minutes**: PR check completion
- **85%+**: Extraction precision
- **95%+**: Spec accuracy maintained

### Product Goals
- **20-40 decisions**: Extracted on first scan (day one value)
- **0 P0 violations**: Reaching merge (enforcement works)
- **80%+ module coverage**: By month 3
- **New developer productivity**: Zero violations from day one

### Business Metrics
- **10 paying teams**: Within 3 months of launch
- **< 5%**: Monthly churn rate
- **> 120%**: Net revenue retention
- **12-15%**: Free to paid conversion rate

## Key Quotes

### On AI Coding Evolution
> "We are entering the age of agentic engineering" — where developers orchestrate AI agents against detailed specifications with human oversight.
> — Andrej Karpathy, early 2026

### On SDD Challenges
> "SDD also introduces a new, unsolved problem: teams must maintain three or four markdown specs per feature in Git, often without tooling that makes this easy or enforceable."
> — EPAM Research, 2026

### On Decision Persistence
> "Context doesn't disappear when a chat session ends or someone leaves the team — unless you make it not disappear."
> — OpenSpec Documentation, April 2026

### On AI Agent Consistency
> "The same spec will produce different code from different agents."
> — Tessl Blog, 2026

## Competitive Landscape

### SDD Tools (Complementary)
- **GitHub Spec Kit**: 90,000+ stars, MIT licensed
- **OpenSpec**: Lightweight, brownfield-first, ADR support
- **AWS Kiro**: Standalone IDE, reported 40h → 8h feature delivery
- **BMAD-METHOD**: 48,400+ stars, role-based multi-agent orchestration
- **Tessl**: Spec-as-source, 47% → 84% accuracy (Cisco case study)

### Decision/Memory Tools (Adjacent)
- **Hivemind**: YC-backed, captures everything but no decision extraction
- **Microsoft Agent Governance**: Runtime permissions, not architectural decisions
- **LangSmith/Langfuse**: Observability (rearview), not proactive

### Manual Processes (Replace)
- **CLAUDE.md / .cursorrules**: Manual maintenance, context eviction
- **Manual ADRs**: Low adoption due to high manual cost

## Timeline Estimates

### MVP Development
- **8-9 weeks**: From start to public launch
- **Team size**: 2-3 engineers + founder
- **Cost**: ~$415/month operating expenses

### Revenue Milestones
- **6 months**: $30K MRR, 10 paying teams
- **12 months**: $150K MRR, 50 paying teams, 3 enterprise customers
- **24 months**: $600K MRR, 200 paying teams, 15 enterprise customers

---

**Last Updated**: June 2026 (Version 1.0)
