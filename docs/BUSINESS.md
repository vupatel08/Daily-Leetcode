# Business Model & Market Strategy

## Market Overview

### The AI Coding Tools Market (2026)

**Adoption Statistics:**
- **85%** of developers now use AI coding tools regularly
- **87%** of Fortune 500 companies use at least one AI coding platform
- **26 million** developers use GitHub Copilot globally
- **18%** enterprise adoption each for Cursor and Claude Code (accelerating)
- **25%** of YC W25 batch: codebases 95% AI-generated

**Market Size:**
- ~27 million professional software developers globally
- ~4 million work in teams of 5-50 at companies actively using AI tools
- This is our addressable market

**Market Growth:**
- AI coding tools market growing at ~50% YoY
- SDD adoption crossed 50% of Fortune 1000 (April 2026)
- Developer tools overall: $40B+ market

### The Problem Space

**Individual productivity**: AI tools made individuals 3-10x more productive.

**Team coordination**: At scale (15+ developers), productivity gains compress to just 31% due to coordination overhead.

**Research-documented issues:**
- 110,000+ AI-introduced issues in production repos (arXiv, Feb 2026)
- Code duplication increased 4x with AI adoption (GitClear, 211M lines studied)
- 45% of AI-generated code contains security vulnerabilities (Veracode)
- Teams hit "three-month wall" where codebases become unmaintainable

**SDD emerged as solution** but left critical gaps:
- Decisions made during building never reach spec automatically
- Specs go stale immediately
- No enforcement mechanism
- Manual maintenance required (nobody does it)

**Groundwork fills the gap**: Automatic capture, propagation, and enforcement of decisions.

## Business Model

### Pricing Tiers

#### Free Tier
**Price:** $0/month

**Limits:**
- 1 developer
- 1 project
- 50 decisions tracked
- Dashboard access (read-only)
- No PR enforcement
- Community support

**Purpose:**
- Zero-friction trial
- No credit card required
- Prove value before asking for payment
- Viral within-company adoption

#### Team Tier
**Price:** $299/month

**Includes:**
- Up to 15 developers
- Unlimited projects
- Unlimited decisions
- Full conflict detection
- GitHub PR enforcement
- Slack notifications
- 90-day decision history
- Email support (24-hour response)

**Target customer:**
- Startup engineering teams (5-15 people)
- Mid-size company product teams
- Agency development teams

#### Growth Tier
**Price:** $799/month

**Includes everything in Team, plus:**
- Up to 50 developers
- Linear and Jira integration
- Coverage heatmap
- Weekly digest reports
- Unlimited decision history
- Priority support (4-hour response)
- Quarterly business review

**Target customer:**
- Established startups (Series A-B)
- Enterprise divisions
- Large product teams

#### Enterprise Tier
**Price:** From $50,000/year (custom)

**Includes everything in Growth, plus:**
- Unlimited developers
- On-premises deployment option
- SAML/SSO
- SOC 2 Type II compliance
- HIPAA/GDPR documentation
- Custom data retention policies
- ADR export in MADR format
- Dedicated customer success manager
- 99.99% uptime SLA
- Custom integrations
- Training and onboarding

**Target customer:**
- Fortune 1000 companies
- Regulated industries (healthcare, finance)
- Companies with strict data governance requirements

### Revenue Model

**Primary revenue:** Subscription (SaaS)

**Unit economics (Team tier):**
- Price: $299/month = $3,588/year
- Gross margin: ~85% (cloud infrastructure costs ~$45/month per team)
- LTV (3 years, 10% churn): ~$9,700
- CAC target: < $2,000
- LTV:CAC ratio: ~4.8:1

**Unit economics (Enterprise):**
- Average deal: $75,000/year
- Gross margin: ~70% (higher support costs, on-prem deployment)
- LTV (5 years, 5% churn): ~$340,000
- CAC target: < $50,000
- LTV:CAC ratio: ~6.8:1

**Revenue projections:**

| Year | Teams | Growth | Enterprise | ARR |
|------|-------|--------|------------|-----|
| Y1 | 50 | 10 | 2 | $379K |
| Y2 | 200 | 50 | 15 | $2.1M |
| Y3 | 600 | 200 | 50 | $7.9M |
| Y4 | 1,500 | 500 | 150 | $21.5M |
| Y5 | 3,000 | 1,000 | 400 | $52M |

## Go-To-Market Strategy

### Phase 1: Product-Led Growth (Months 1-6)

**Target:** 100 teams, $350K ARR

**Tactics:**
1. **Free tier as distribution**
   - No credit card required
   - Viral loop: Developer installs → extracts decisions → shares with team → team upgrades
   
2. **Content marketing**
   - Blog: "How we reduced AI-generated tech debt by 80%"
   - Case studies from beta users
   - Technical deep-dives (decision graph architecture, extraction algorithms)
   
3. **Community presence**
   - Active in Cursor Discord, Claude Code forums
   - Answer questions about AI coding at scale
   - Sponsor meetups and conferences
   
4. **GitHub/npm distribution**
   - Open source MCP server (Apache 2.0)
   - GitHub Action in marketplace
   - npm package with clear README
   - "Install and value in 5 minutes" promise

### Phase 2: SDD Tool Partnerships (Months 6-12)

**Target:** 500 teams, $1.5M ARR

**Tactics:**
1. **Official integrations**
   - Partner with OpenSpec, GitHub Spec Kit, BMAD maintainers
   - Get listed in their documentation
   - Co-marketing blog posts
   
2. **Bundle deals**
   - Offer Groundwork subscription bundled with SDD tool
   - Revenue sharing arrangement
   
3. **Conference presence**
   - Speak at DevOps, SDD, and AI coding conferences
   - Demo booth at major events
   - Workshop: "AI-assisted development at team scale"

### Phase 3: Enterprise Sales (Months 12-24)

**Target:** 50 enterprise customers, $5M+ ARR

**Tactics:**
1. **Dedicated sales team**
   - Hire 3-5 enterprise AEs
   - Target Fortune 1000 with active SDD pipelines
   
2. **Security & compliance**
   - SOC 2 Type II certification (required for enterprise)
   - HIPAA documentation
   - On-premises deployment option
   
3. **Executive positioning**
   - Position as "governance layer for AI development"
   - Sell to VPs of Engineering and CTOs
   - ROI calculator: "How much does AI-generated tech debt cost you?"

### Phase 4: Platform Play (Months 24+)

**Target:** Become the standard decision layer

**Tactics:**
1. **API platform**
   - Public API for third-party integrations
   - Marketplace for decision templates
   - Plugin ecosystem
   
2. **White-label offering**
   - Let SDD tools white-label Groundwork
   - Become infrastructure layer they build on
   
3. **M&A opportunities**
   - Acquisition target for GitHub, AWS, Atlassian
   - Or acquire smaller SDD tools to control full stack

## Competitive Positioning

### Direct Competitors

**Hivemind (Activeloop)** - YC-backed, memory layer for AI coding
- **Their strength**: Captures everything from sessions
- **Their weakness**: No decision extraction, no enforcement
- **Our differentiation**: We extract structured decisions and enforce them

**Microsoft Agent Governance Toolkit**
- **Their strength**: Enterprise-grade, Microsoft ecosystem
- **Their focus**: Runtime permissions and security
- **Our differentiation**: We govern architectural decisions, not agent permissions

### Indirect Competitors

**Static files (CLAUDE.md, .cursorrules)**
- **Their weakness**: Manual maintenance, context eviction, no enforcement
- **Our pitch**: "You're already maintaining CLAUDE.md. We automate that."

**Manual ADR processes**
- **Their weakness**: Low adoption due to high manual cost
- **Our pitch**: "ADRs, but automatic. Zero extra work."

### Competitive Moats

1. **The Decision Graph compounds**
   - More sessions → richer graph
   - Richer graph → better extraction accuracy
   - Better accuracy → more trust → more adoption
   - Network effect within each team

2. **High switching cost**
   - Decision graph is team's architectural knowledge
   - Captured over months/years
   - Deeply integrated into workflows
   - Painful to migrate to competitor

3. **Data moat**
   - Real-world decision data trains better extraction models
   - Fine-tune on actual sessions → higher accuracy
   - Competitors start from scratch

4. **Integration ecosystem**
   - First to integrate with all major AI tools
   - First to integrate with all major SDD tools
   - Network effects: more integrations → more users → more integrations

## Customer Acquisition

### Acquisition Channels

| Channel | CAC | Conversion | Volume | Priority |
|---------|-----|------------|--------|----------|
| Product virality (free tier) | $50 | 12% | High | #1 |
| Content marketing (blog, SEO) | $200 | 8% | Medium | #2 |
| SDD tool partnerships | $100 | 15% | Medium | #3 |
| GitHub/npm discovery | $30 | 5% | High | #4 |
| Conference presence | $1,500 | 20% | Low | #5 |
| Outbound sales (enterprise) | $8,000 | 35% | Low | #6 |

### Viral Loop

```
Developer 1 discovers Groundwork
    ↓
Installs on local machine (free tier)
    ↓
Works on project, decisions extracted
    ↓
Developer 2 on same team gets conflict warning
    ↓
"What's Groundwork? How did it know?"
    ↓
Developer 2 installs
    ↓
Team sees value
    ↓
Upgrade to Team tier ($299/mo)
    ↓
Invite more teammates
    ↓
[Loop continues]
```

**Viral coefficient target:** 1.5 (each user brings 1.5 more users on average)

### Conversion Funnel

```
1000 free tier signups
  ↓ 30% activate (actually use it)
300 active free users
  ↓ 15% convert to paid (team tier)
45 paying teams
  ↓ 10% upgrade to growth tier
4.5 growth tier customers
  ↓ 5% upgrade to enterprise
0.2 enterprise customers

Monthly revenue: (40 × $299) + (4 × $799) + (0.2 × $6,250) = $15,206
```

**Goal:** 1000 free signups/month → ~$15K MRR/month growth

## Key Metrics

### Acquisition Metrics
- Free tier signups per month
- Free → Team conversion rate (target: 12-15%)
- CAC by channel
- Viral coefficient (target: > 1.3)

### Engagement Metrics
- Weekly active teams (teams with ≥1 session/week)
- Decisions extracted per team per week (target: 5+)
- Conflicts detected per team per sprint (value proof)
- PR checks run per team per week

### Revenue Metrics
- MRR and ARR
- Net revenue retention (target: > 120%)
- Monthly churn (target: < 5%)
- Expansion revenue (upgrades from Team → Growth → Enterprise)

### Product Metrics
- Extraction precision (target: > 85%)
- Injection latency (target: < 80ms)
- PR check completion time (target: < 2min)
- Dashboard load time (target: < 1s)

## Fundraising Strategy

### Bootstrap vs. Raise

**Option A: Bootstrap (recommended for first $1M ARR)**

Advantages:
- Full control
- Focus on product and customers, not investors
- Can raise later at better valuation once proven
- No dilution

Requirements:
- Keep burn low ($30-50K/month)
- Small team (2-3 engineers + founder)
- Reach profitability by $1M ARR

**Option B: Seed Round ($2M)**

Raise when:
- Product proven (100+ paying teams)
- Clear path to $10M ARR
- Need capital to accelerate (hire sales team, marketing)

Use of funds:
- $800K: Engineering (4 engineers × 18 months)
- $600K: Sales & marketing (2 AEs, 1 marketer × 18 months)
- $400K: Infrastructure & tools
- $200K: Legal, accounting, misc

Raise from:
- YC (if accepted)
- Dev tools focused VCs (Heavybit, Uncork, Essence)
- Strategic angels from AI coding space

### Exit Scenarios

**Acquisition targets (3-5 years):**
1. **GitHub** - Add decision layer to Spec Kit, integrate with Copilot
   - Valuation range: $50-150M
   
2. **Atlassian** - Add to Jira/Confluence ecosystem
   - Valuation range: $40-100M
   
3. **AWS** - Integrate with Kiro, sell to AWS customers
   - Valuation range: $60-200M
   
4. **Microsoft** - Add to Azure DevOps + Copilot
   - Valuation range: $80-250M

**IPO scenario (7-10 years):**
- Need $100M+ ARR
- Strong growth (40%+ YoY)
- Clear path to profitability
- Market leader in decision governance space

## Team & Organization

### Founding Team (MVP Phase)

**Ideal founding team:**
- 1 technical founder (CTO): Backend, distributed systems, AI/ML
- 1 technical founder (CPO): Frontend, UX, product strategy
- 1 founder (CEO): Sales, fundraising, vision

**Minimum viable team:**
- 2 senior full-stack engineers
- 1 founder (wears CEO + product hats)

### Hiring Roadmap

| Phase | Hires | Total Team |
|-------|-------|------------|
| MVP (Months 1-3) | 0 (founders only) | 2-3 |
| Launch (Months 3-6) | +1 engineer, +1 support | 4-5 |
| Growth (Months 6-12) | +2 engineers, +1 marketer, +1 sales | 9 |
| Scale (Months 12-24) | +4 engineers, +3 sales, +1 CSM | 17 |

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| MCP protocol changes | Medium | High | Monitor closely, maintain backwards compatibility |
| AI tool releases built-in decision capture | Low | Critical | First-mover advantage, build moat via integrations |
| Low willingness to pay | Medium | High | Validate with 10 paying customers before building enforcement |
| Extraction accuracy insufficient | Low | High | Start with high-confidence extractors, tune based on feedback |
| Privacy concerns block adoption | Medium | Medium | On-premises option, full transparency on data handling |
| Competitive threat from big tech | High | Critical | Move fast, lock in integrations, focus on SMB initially |

## Success Criteria

### 6 Months
- [ ] 100+ teams on free tier
- [ ] 10 paying teams (Team tier or above)
- [ ] $30K MRR
- [ ] < 10% monthly churn
- [ ] 85%+ extraction precision

### 12 Months
- [ ] 500+ teams on free tier
- [ ] 50 paying teams
- [ ] $150K MRR
- [ ] 3 enterprise customers
- [ ] Integrations with top 3 SDD tools
- [ ] Break-even or profitable

### 24 Months
- [ ] 2,000+ teams on free tier
- [ ] 200 paying teams
- [ ] $600K MRR
- [ ] 15 enterprise customers
- [ ] $7M+ ARR
- [ ] Category leader in "AI decision governance"

---

**Bottom line:** $14.4B TAM, clear gap in market, product-led growth with enterprise expansion path. We're building the infrastructure layer that makes AI coding work at team scale.
