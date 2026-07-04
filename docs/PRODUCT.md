# GROUNDWORK
## The Decision Layer That Makes AI Development Actually Work at Team Scale
### The Complete Product Document

**Version 1.0 | June 2026**

---

# PART ONE: THE WORLD AS IT IS RIGHT NOW

## Chapter 1: How Software Gets Built in 2026

Let's start from zero so everyone is on the same page.

Software is built by developers. Developers write code. Code tells computers what to do. Simple enough.

But something changed in the last two years that changed everything.

AI coding tools arrived. Tools like Claude Code, Cursor, GitHub Copilot, and Windsurf. These tools let developers describe what they want in plain English and have the AI write the actual code.

This was a massive deal. Things that used to take a week started taking a day. Things that used to take a day started taking an hour.

**Key Statistics:**
- 87% of Fortune 500 companies now use AI coding tools
- 85% of developers use AI regularly
- 25% of Y Combinator's Winter 2025 batch shipped codebases that are 95% AI-generated

AI coding is not the future. It is right now. Today.

## Chapter 2: The First Problem — Vibe Coding

When AI coding tools first arrived, everyone used them the same way.

You'd open the AI tool, describe what you want in a sentence or two, and let it generate the code. If it wasn't right, you'd keep chatting with it until it was. Then you'd ship.

This style of working got a name: **vibe coding**.

Andrej Karpathy — one of the most respected AI researchers in the world, former head of AI at Tesla — coined the term in early 2025. The idea: you vibe with the AI, it generates code, you ship.

And for a while it worked great. Especially for small projects. Especially for solo developers. Especially for prototypes.

### The Data Started Coming In

GitClear studied 211 million lines of code written with AI assistance:
- Code duplication increased **fourfold**
- Copy-paste instances rose approximately **48%**
- Refactoring dropped roughly **60%**

A CMU study on Cursor adoption found:
- Code complexity increased by approximately **41%**
- Static analysis warnings increased by **30%**

Veracode found:
- **45%** of AI-generated code contained known security vulnerabilities
- Java samples failed **72%** of the time

### The Three-Month Wall

Teams hit what researchers started calling the "three-month wall." Everything feels fast for the first few weeks. Then the codebase becomes a mess. The AI keeps duplicating things. It ignores decisions the team made. It builds the same thing three different ways in three different parts of the product. Nothing is consistent.

By early 2026, Andrej Karpathy himself said that era was ending:

> "We are entering the age of agentic engineering" — where developers orchestrate AI agents against detailed specifications with human oversight. Not just vibing anymore.

## Chapter 3: The Second Problem — Teams

The vibe coding mess is bad for one developer.

For a team of five developers all using AI tools simultaneously? It is catastrophic.

### The Core Issue

When five developers each open their AI coding tool and start working, they are each having a **separate, private conversation** with their AI.

Claude Code on developer 1's machine knows nothing about what Cursor on developer 2's machine is doing. They are completely isolated from each other.

And AI agents, by design, **forget everything when a session ends**. Every new session starts completely blank. The AI has no memory of what was decided yesterday. No memory of what other developers decided this week.

### The Pattern That Repeats Constantly

**Monday**: Developer 1 spends morning talking with Claude Code about the user system. They decide: user IDs will be UUID format (a specific type of unique identifier string). Makes sense. Claude Code helps build it. Session ends.

**Tuesday**: Developer 2 opens Cursor. They need to build the billing system. Cursor has no idea what developer 1 decided. It suggests using simple integer IDs (1, 2, 3, 4...) because they're simpler. Developer 2 agrees. Cursor helps build it. Session ends.

**Wednesday**: Developer 3 opens a different AI tool. They're building the API layer that connects everything. Their AI sees that user IDs are UUIDs in some places and integers in other places. Confused, it picks email addresses as the primary identifier to "avoid the conflict." Session ends.

**Thursday**: The tests break. Everything is inconsistent. Nobody knows why. Code review is a disaster. Two days of rework.

### The Research

A large-scale empirical study published on arXiv in February 2026 counted more than **110,000 surviving AI-introduced issues** in production repositories. Issues that made it past code review into actual live software.

Researchers named this pattern **"architectural drift."** Agents make locally sensible but globally inconsistent decisions. Each AI decision looks reasonable in isolation. Together they form chaos.

At larger team scales — 15 developers and above — the productivity gains from AI tools compress to just **31%** because coordination overhead and review of AI-generated code becomes the new bottleneck.

**The tools are fast. The coordination between them is broken.**

## Chapter 4: The Attempted Solution — Spec-Driven Development

The engineering world noticed these problems and responded.

A new methodology emerged in 2025 called **Spec-Driven Development (SDD)**.

### The Concept

Instead of just prompting the AI and hoping for the best, you write a proper specification first.

A specification is a document that describes:
- Exactly what you want to build
- What decisions have been made about how to build it
- What the rules are
- What success looks like

Then you give that specification to the AI. The AI now has a contract to work from. It's not guessing anymore. It knows exactly what to do.

### The Results

Early reports from GitHub and AWS showed teams using SDD approached an order of magnitude fewer "regenerate from scratch" cycles.

**Documented Success Stories:**
- **Mercari** (Japanese tech giant): 150% speed gain using spec-driven approach for agents
- **Google**: 50% time reduction on migrations with 80% AI-authored code using SDD
- **AWS Kiro customers**: 40-hour features shipped in under 8 hours

### The Adoption Wave

By March 2026, over 100,000 developers adopted SDD approaches in the first five days of new SDD tool previews.

By April 2026, more than **50% of Fortune 1000 companies** had at least one active SDD pipeline running.

Every major AI coding tool shipped their own version of SDD:
- GitHub Spec Kit
- AWS Kiro
- Claude Code
- Cursor
- OpenSpec
- BMAD
- Google Antigravity

**The industry moved fast. SDD became the new standard.**

## Chapter 5: The Problem With SDD That Nobody Solved

SDD was a big improvement. But it introduced a new problem.

**And this is the exact problem Groundwork was built to solve.**

### How SDD Works in Practice

The team writes a specification document. It says things like:
- "We are using Postgres as our database"
- "We use Prisma as our ORM"
- "User IDs are UUID strings"
- "All API responses use camelCase"

Each developer loads this spec into their AI tool before starting work. The AI reads the spec. Now it knows the rules.

This works. Until reality hits.

### Problem 1: Specs Go Stale Immediately

Software changes constantly. Every day developers make new decisions:
- "We decided to use Redis for caching"
- "We switched from REST to tRPC"
- "We added a new pattern for handling errors"

Every one of those decisions needs to be added to the spec **manually**. But developers are busy. They forget. They're in flow. They don't stop to update a markdown file every time they make a micro-decision.

Researchers documented this specifically. They called it **"spec drift."** The spec says one thing. The actual codebase has diverged. Now the AI is working from a specification that no longer reflects reality.

The SDD governance paper published in 2026 stated it directly:

> "SDD's unsolved problem is governance at scale: specs are behavior-determining artifacts, and at fleet scale they need what code got decades ago — versions, owners, review, and a link from spec version to deployed behavior."

### Problem 2: Decisions Made During AI Sessions Never Reach the Spec

**This is the critical one.**

When a developer has a long AI coding session, dozens of small decisions get made inside that conversation:
- Which approach to use
- Which library to pick
- How to structure a particular module
- How to handle a specific edge case

The AI session ends. Those decisions exist nowhere except in the chat history. They never reach the spec. They never reach the other developers.

A month later, another developer's AI makes completely different decisions about the same things. The spec never said anything about it. The previous decision was lost.

OpenSpec's own documentation acknowledged this:

> "Context doesn't disappear when a chat session ends or someone leaves the team — unless you make it not disappear."

But they have no automated solution for it. A developer must manually go back, open the spec file, and write down what was decided. **Nobody does this consistently.**

### Problem 3: No Enforcement

Even when the spec exists and is up to date, there is nothing that actively stops an AI from violating it.

A developer loads the spec. Their AI reads it. But as the session gets long, the spec gets pushed out of the AI's active memory by newer context. The AI starts making suggestions that contradict the spec. The developer might not notice.

Then that code goes into a PR (pull request — a proposed code change). Nobody checks it against the spec. It gets reviewed for logic and bugs. Not for spec compliance. It merges.

Now the codebase has code that violates the team's own specification. The spec says one thing. The code does another. The next AI session reads the codebase and gets confused about what the real rules are.

### Problem 4: SDD Requires Too Much Manual Maintenance

EPAM's research stated:

> "SDD also introduces a new, unsolved problem: teams must maintain three or four markdown specs per feature in Git, often without tooling that makes this easy or enforceable."

One test showed SDD taking **33 minutes plus 2,577 lines of markdown** to produce 689 lines of code. That's the spec overhead crushing the speed advantage AI was supposed to deliver.

Teams are already exhausted. Adding more documentation requirements on top of everything else doesn't get adopted. It gets ignored.

### The Summary of the Gap

SDD told teams: write your decisions down before you build. It made AI coding significantly better.

But it left three things completely unsolved:

1. **Automatically capturing decisions** that happen DURING building
2. **Keeping the spec alive and current** without manual work
3. **Enforcing spec compliance** in a way that actually blocks violations

**That gap — automatic capture, automatic currency, active enforcement — is exactly what Groundwork fills.**

---

# PART TWO: WHAT GROUNDWORK IS

## Chapter 6: The Simple Version

Groundwork is a tool that sits underneath every AI coding tool your team uses.

It watches what happens in AI coding sessions. It figures out when a decision was made. It remembers that decision. It tells every other developer's AI about it automatically.

And if someone's AI tries to build something that contradicts a decision the team already made — Groundwork stops it. Right there. Before the code gets written. Before the PR gets opened. Before anyone has to review something that was wrong from the start.

**That's it. That's the whole product.**

SDD says: write your decisions down before you build.

Groundwork says: we'll capture your decisions as you build, keep them current automatically, and enforce them everywhere.

**SDD is the discipline. Groundwork is the infrastructure that makes the discipline actually work without requiring humans to maintain it manually.**

## Chapter 7: Where Groundwork Sits in the Stack

To understand Groundwork, you need to understand the layers of how an engineering team builds software with AI tools.

```
LAYER 5: WHAT YOU WANT TO BUILD
         (product requirements, user stories, roadmap)
         ← This is what product managers write

LAYER 4: HOW YOU PLAN TO BUILD IT
         (specifications, architecture design, acceptance criteria)
         ← This is what SDD tools like OpenSpec and GitHub Spec Kit do

LAYER 3: WHAT YOUR TEAM HAS ALREADY DECIDED
         (architectural decisions, technology choices, patterns, constraints)
         ← THIS IS THE GAP. THIS IS WHAT GROUNDWORK FILLS.

LAYER 2: THE AI TOOLS DOING THE BUILDING
         (Claude Code, Cursor, Windsurf, Copilot, Codex)
         ← These are the agents doing the actual coding

LAYER 1: THE CODE THAT GETS PRODUCED
         (the actual software running in production)
```

SDD tools operate at **Layer 4**. They help you write better specs before you start building.

AI coding tools operate at **Layer 2**. They do the actual coding.

**Layer 3** — the living record of what your team has already decided — has been completely unaddressed. Every tool assumes someone will maintain it manually. Nobody does.

**Groundwork is Layer 3.** The persistent, automatic, enforced decision layer that sits between your specifications and your AI tools.

## Chapter 8: How Groundwork Works — Step by Step

### Step 1: Installation (one time, 5 minutes)

A developer installs the Groundwork CLI tool on their computer. They run one command in their project folder.

```bash
npm install -g @groundwork/cli
cd your-project
groundwork init
```

Groundwork immediately scans the existing project — reading files like CLAUDE.md, package.json, the database schema, existing architecture documents — and automatically populates a starting set of decisions from what already exists in the codebase.

For a typical project, this produces **20-40 decisions automatically on day one**. Before anyone has had a single AI session with Groundwork running.

This solves the cold start problem. The tool feels intelligent immediately.

### Step 2: Connection (one time, 2 minutes)

The developer runs one more command to connect Groundwork to their AI coding tools.

```bash
groundwork connect
```

It works with Claude Code, Cursor, Windsurf, Copilot — any tool that supports **MCP (Model Context Protocol)**, which is the industry standard all major AI tools now support.

### Step 3: Normal Work (ongoing, invisible)

From this point, the developer works exactly as they always have. They open their AI coding tool. They ask it to build things. They have conversations. They review the code.

**Groundwork runs silently in the background.**

When the developer's session starts, Groundwork automatically injects the relevant decisions into the AI's context. The AI now knows — before the developer says anything — what the team has already decided about the area they're working on.

When the developer's session ends, Groundwork processes what happened. It uses AI to analyze the conversation and identify any decisions that were made. It adds those decisions to the shared project decision graph.

**The developer doesn't write anything down. Groundwork captures it.**

### Step 4: Cross-Team Propagation (automatic, real-time)

When developer 2 starts their session the next day, Groundwork already knows what developer 1 decided yesterday. That information is automatically injected into developer 2's AI context before they start.

Developer 2's AI tool was not in developer 1's session. But it knows what was decided. Because Groundwork told it.

### Step 5: Conflict Detection (automatic, real-time)

If developer 2's AI is about to suggest something that contradicts a decision developer 1 already made, Groundwork flags it.

Not after the code is written. Not at code review. **Right now, in real time, before a single incorrect line is generated.**

The developer sees:

> "Groundwork: This approach conflicts with decision #7 — User IDs are UUID strings (decided by [teammate] on Monday). Proceeding will create an inconsistency."

### Step 6: PR Enforcement (automatic, on every pull request)

When a developer submits a PR — a request to merge their code into the main codebase — a GitHub Action runs automatically.

It analyzes every changed line of code against the decision graph.

If any code violates a critical decision, the PR is blocked. It cannot be merged until the violation is fixed or the team formally changes the decision.

**This is the enforcement layer that SDD has been missing. Not just guidance. Not just warnings. An actual gate that protects the codebase.**

## Chapter 9: The Decision Graph — The Heart of Groundwork

Everything in Groundwork flows through the **Decision Graph**.

The graph is not a flat list of rules. It is a living network of decisions and their relationships to each other.

### What a Decision Looks Like

```yaml
Decision #7
Title: User IDs are UUID v4 strings
Domain: Schema (database structure)
Priority: P0 (critical — always enforced)
Made by: Sarah
Made on: January 13, 2026
Source: Extracted from Claude Code session
Confidence: 0.97
Status: Active
Affects: Auth module, Billing module, API endpoints, Frontend
Rationale: Portable across microservices, no ordering leakage
Rejected alternatives: Integer auto-increment, ULID
Injected into: 47 AI sessions across the team
```

### Relationships Between Decisions

```
Decision #1 (Use Postgres) 
  ↓ CONSTRAINS
Decision #5 (Use Prisma ORM)
  ↓ CONSTRAINS
Decision #9 (No raw SQL)

Decision #7 (UUID user IDs) 
  ⚠ CONFLICTS_WITH
Decision #23 (Integer billing IDs)

Decision #15 (JWT authentication) 
  ↓ DEPENDS_ON
Decision #7 (UUID user IDs)
```

These relationships matter enormously.

When a team considers changing Decision #1 from Postgres to MongoDB, Groundwork immediately surfaces:

> "This change affects Decision #5 (Prisma ORM), Decision #9 (No raw SQL), and 3 other decisions. Here are the downstream implications."

You cannot see this from a flat list. You can only see it from a graph. **That graph is Groundwork's core data structure and its deepest technical moat.**

### Priority Levels

**P0 — Critical constraints**
- Schema decisions, authentication patterns, API contracts
- Always injected into every relevant AI session
- Violations block PR from merging

**P1 — Important patterns**
- Coding conventions, tool choices, testing approaches
- Injected when the session domain matches
- Violations produce warnings on PR

**P2 — Soft guidance**
- Style preferences, minor conventions
- Available on request
- No blocking enforcement

### Decision Lifecycle

```
PROPOSED → decision extracted but confidence below threshold,
           needs human approval before becoming active

ACTIVE → enforced, injected into AI sessions, checked in PRs

DISPUTED → someone raised a conflict, both sides paused until
           team resolves it

SUPERSEDED → replaced by a newer decision, preserved in history

DEPRECATED → no longer relevant (feature was removed), preserved
             but no longer injected
```

---

*[Continued in additional documentation files]*

---

**Document Index:**
- [Part 3: Groundwork + Spec-Driven Development](./SDD_INTEGRATION.md)
- [Part 4: Technical Foundation](./ARCHITECTURE.md)
- [Part 5: The Business](./BUSINESS.md)
- [Part 6: Implementation Guide](./MVP.md)
