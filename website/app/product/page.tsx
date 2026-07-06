import { Section } from "@/components/section";
import { InstallBlock } from "@/components/install-block";
import { MarkdownContent } from "@/components/markdown-content";
import { InjectionTerminal } from "@/components/demos/injection-terminal";
import { ConflictAlert } from "@/components/demos/conflict-alert";
import { DecisionTimeline } from "@/components/demos/decision-timeline";
import { CodebaseDashboardPreview } from "@/components/docs/visuals/codebase-dashboard-preview";
import { Container } from "@/components/ui/container";
import { SectionRule } from "@/components/ui/section-rule";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product",
  description: "Scan, extract, inject, and enforce — the decision layer for AI dev teams.",
};

const SECTIONS = [
  {
    id: "scan",
    title: "No cold start on day one",
    body: `Run \`groundwork init\` in any existing repo. Groundwork reads the files your team already uses to encode decisions — CLAUDE.md, package.json, Prisma schemas, git history, CI config — and loads them into the graph immediately.

New teammates inherit the full constraint set before their first prompt.`,
    code: `groundwork init
groundwork scan    # re-scan after major changes`,
  },
  {
    id: "graph",
    title: "Git for what your team decided",
    body: `Every decision is a node: domain, priority, content, rationale, confidence, status, and typed edges to other nodes.

Statuses: **PROPOSED**, **ACTIVE**, **DISPUTED**, **SUPERSEDED**, **DEPRECATED**. Only ACTIVE decisions inject and enforce.`,
    code: `groundwork status`,
  },
  {
    id: "mcp",
    title: "MCP-native propagation",
    body: `Groundwork connects through the Model Context Protocol — supported by Claude Code, Cursor, and any MCP client.

Four tools: \`groundwork_get_decisions\`, \`groundwork_check_intent\`, \`groundwork_record_decision\`, \`groundwork_stats\`.`,
    code: `groundwork connect
# paste MCP config into Claude Code or Cursor`,
  },
  {
    id: "inject",
    title: "Context before the first line of code",
    body: `Your AI calls \`groundwork_get_decisions\` before writing code. P0 decisions always inject. P1 decisions match on domain and affected modules.

Run \`groundwork status\` anytime to see what the graph contains.`,
  },
  {
    id: "conflicts",
    title: "Tuesday's fix, not Friday's call",
    body: `When a new decision contradicts an active one, both get flagged **DISPUTED** or **CONFLICTED**. Neither injects as gospel until resolved.

The classic case: billing schema uses \`INTEGER\` for \`user_id\`; project constraint says UUID strings.`,
  },
  {
    id: "enforce",
    title: "P0 violations never merge",
    body: `The GitHub Action checks every PR diff against active decisions. P0 violations **block the merge button**. P1 violations post a warning comment.

Fix the violation, push, and the check re-runs.`,
    code: `# .github/workflows/groundwork.yml
- uses: groundwork-dev/decision-check@v1
  with: { fail-on-p0: true }`,
  },
  {
    id: "dashboard",
    title: "See the whole graph",
    body: `The local dashboard shows decisions, an interactive relationship graph, a timeline feed, and open conflicts.

\`PROJECT_PATH=./your-project node packages/api/dist/index.js\` → http://localhost:4000`,
    code: `npm run build --workspace=@groundwork/api
PROJECT_PATH=. node packages/api/dist/index.js`,
  },
];

export default function ProductPage() {
  return (
    <>
      <section className="border-b-4 border-foreground">
        <Container className="py-20 md:py-28">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Product</p>
          <h1 className="font-display mt-4 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
            The decision layer for AI teams
          </h1>
          <p className="mt-6 max-w-2xl font-body text-xl leading-relaxed text-muted-foreground">
            Capture, propagate, and enforce architectural decisions — without another doc to maintain.
          </p>

          <nav className="mt-10 flex flex-wrap gap-0 border-2 border-foreground" aria-label="Product sections">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="border-r-2 border-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-widest last:border-r-0 transition-colors duration-100 hover:bg-foreground hover:text-background"
              >
                {s.id}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      {SECTIONS.map((section, i) => (
        <div key={section.id}>
          {i > 0 && <SectionRule variant="thick" />}
          <Section id={section.id} texture={i % 2 === 1 ? "grid" : "none"}>
            <div className={`grid gap-12 lg:grid-cols-2 lg:items-start ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}>
              <div className={i % 2 === 1 ? "lg:[direction:ltr]" : ""}>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{section.title}</h2>
                <div className="mt-6">
                  <MarkdownContent content={section.body} />
                </div>
                {section.code && (
                  <pre className="mt-8 overflow-x-auto border-2 border-foreground bg-muted p-6 font-mono text-sm leading-relaxed">
                    {section.code}
                  </pre>
                )}
              </div>

              <div className={i % 2 === 1 ? "lg:[direction:ltr]" : ""}>
                {section.id === "inject" && <InjectionTerminal />}
                {section.id === "conflicts" && <ConflictAlert />}
                {section.id === "graph" && <DecisionTimeline />}
                {section.id === "dashboard" && <CodebaseDashboardPreview />}
                {section.id === "scan" && (
                  <div className="border-2 border-foreground bg-muted p-6 font-mono text-sm leading-relaxed">
                    <p className="text-muted-foreground">$ groundwork init</p>
                    <p className="mt-4">✔ extracted 28 decisions</p>
                    <p className="mt-2">P0: 18 · P1: 8 · P2: 2</p>
                  </div>
                )}
                {section.id === "mcp" && (
                  <pre className="overflow-x-auto border-2 border-foreground bg-foreground p-6 font-mono text-sm text-background">
{`{
  "mcpServers": {
    "groundwork": {
      "command": "groundwork-mcp"
    }
  }
}`}
                  </pre>
                )}
                {section.id === "enforce" && (
                  <div className="border-2 border-foreground bg-muted p-6 font-mono text-sm">
                    <p className="text-[var(--status-conflicted)]">✗ P0 VIOLATION</p>
                    <p className="mt-4">D004 · UUID user IDs</p>
                    <p className="mt-2 text-muted-foreground">billing.user_id = INTEGER</p>
                    <p className="mt-6 border-t-2 border-foreground pt-4">Merge blocked</p>
                  </div>
                )}
              </div>
            </div>
          </Section>
        </div>
      ))}

      <section className="bg-foreground py-20 text-background">
        <Container className="text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Try it on your repo</h2>
          <div className="mx-auto mt-10 max-w-xl">
            <InstallBlock inverted />
          </div>
        </Container>
      </section>
    </>
  );
}
