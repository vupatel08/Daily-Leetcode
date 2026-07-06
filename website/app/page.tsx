import { InstallBlock } from "@/components/install-block";
import { AgentPills } from "@/components/agent-pills";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionRule } from "@/components/ui/section-rule";
import { IconCircle } from "@/components/ui/icon-circle";
import { HowItWorksExplorer } from "@/components/how-it-works-explorer";
import { ConflictAlert } from "@/components/demos/conflict-alert";
import { DecisionTimeline } from "@/components/demos/decision-timeline";
import { HeroStackIllustration } from "@/components/illustrations/hero-stack";
import { SITE } from "@/lib/site";
import Link from "next/link";
import { GitBranch, Shield, Share2, Scan, Gavel, LayoutDashboard } from "lucide-react";

const PROBLEM_CARDS = [
  {
    day: "Monday",
    title: "Dev 1 decides UUIDs",
    body: "Forty minutes in Claude Code on auth. UUID v4 strings, server-generated. Good decision. Never written down.",
  },
  {
    day: "Tuesday",
    title: "Dev 2 builds billing",
    body: "Cursor session on subscriptions. Never asks about user IDs. Suggests integers. Clean, simple, performant.",
  },
  {
    day: "Thursday",
    title: "Tests break",
    body: "Auth uses UUIDs. Billing references integers. Nobody was careless. Two AIs, zero shared memory.",
  },
];

const PILLARS = [
  { icon: Scan, title: "Onboarding scan", body: "init reads CLAUDE.md, Prisma, git history, CI — decisions loaded in seconds.", href: "/product#scan" },
  { icon: GitBranch, title: "Decision graph", body: "Git for team decisions. Immutable history, live status, typed edges.", href: "/product#graph" },
  { icon: Share2, title: "MCP propagation", body: "Every teammate's AI pulls the same constraints via MCP tools.", href: "/product#mcp" },
  { icon: Shield, title: "Conflict detection", body: "Integer user_id vs UUID? Flagged mid-session, not in the retro.", href: "/product#conflicts" },
  { icon: Gavel, title: "PR enforcement", body: "P0 violations block the merge button. GitHub Action on every PR.", href: "/product#enforce" },
  { icon: LayoutDashboard, title: "Dashboard", body: "Decisions, graph, timeline, conflicts — one local UI.", href: "/product#dashboard" },
];

const STATS = [
  { value: "<60s", label: "Decision propagation" },
  { value: "<80ms", label: "Injection latency" },
  { value: "0", label: "P0 violations merged" },
];

export default function HomePage() {
  return (
    <>
      <section className="texture-noise relative overflow-hidden border-b-4 border-foreground">
        <div className="pointer-events-none absolute inset-0 texture-lines" aria-hidden />
        <Container className="relative py-24 md:py-32 lg:py-40">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_min(420px,38%)] lg:gap-16 xl:gap-20">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Layer 3 · The decision layer
              </p>

              <h1 className="font-display mt-8 max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tighter md:text-7xl lg:text-8xl">
                Architectural decisions
                <br />
                <span className="italic">your AI won&apos;t forget.</span>
              </h1>

              <div className="mt-10 flex items-start gap-6">
                <div className="hidden h-16 w-4 shrink-0 bg-foreground md:block" aria-hidden />
                <p className="max-w-2xl font-body text-xl leading-relaxed text-muted-foreground md:text-2xl">
                  Groundwork sits underneath Claude Code, Cursor, and every MCP-compatible tool.
                  It captures what your team decided, stores it as a shared graph, propagates
                  constraints in real time, and blocks PRs that violate them.
                </p>
              </div>

              <div className="mt-12 max-w-2xl">
                <InstallBlock />
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="/docs/getting-started/install" variant="primary">
                  Read the docs
                </Button>
                <Button href={SITE.github} variant="secondary" external>
                  GitHub
                </Button>
              </div>

              <p className="mt-10 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                MIT · MCP-native · Works with the agents you already use
              </p>
            </div>

            <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none lg:pt-16">
              <HeroStackIllustration />
            </div>
          </div>
        </Container>

        <Container className="relative pb-16 md:pb-24">
          <AgentPills />
        </Container>
      </section>

      <SectionRule variant="ultra" />

      <Section
        eyebrow="The week we&apos;ve all had"
        title="Five developers. Five AIs. Zero shared memory."
        subtitle="Researchers call it architectural drift. Groundwork calls it fixable."
      >
        <div className="grid gap-0 md:grid-cols-3 md:border-2 md:border-foreground">
          {PROBLEM_CARDS.map((card) => (
            <div
              key={card.day}
              className="border-2 border-foreground p-8 transition-colors duration-100 hover:bg-foreground hover:text-background md:border-0 md:[&:not(:last-child)]:border-r-2"
            >
              <p className="font-mono text-xs uppercase tracking-widest">{card.day}</p>
              <h3 className="font-display mt-4 text-2xl font-semibold">{card.title}</h3>
              <p className="mt-4 font-body text-base leading-relaxed opacity-80">{card.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <SectionRule variant="thick" />

      <Section
        eyebrow="How it works"
        title="Scan. Extract. Inject. Enforce."
        subtitle="Automatic from day one. No cold start. No doc to maintain."
        texture="grid"
      >
        <HowItWorksExplorer />
      </Section>

      <SectionRule variant="thick" />

      <Section inverted texture="lines">
        <div className="grid gap-0 md:grid-cols-3 md:divide-x-2 md:divide-background/20">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-b-2 border-background/20 py-10 text-center last:border-b-0 md:border-b-0 md:py-0">
              <p className="font-display text-7xl font-semibold tracking-tighter md:text-8xl">{stat.value}</p>
              <p className="mt-4 font-mono text-xs uppercase tracking-widest text-background/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <SectionRule variant="ultra" />

      <Section eyebrow="Product" title="Six things Groundwork does">
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="group border-2 border-foreground p-8 transition-colors duration-100 hover:bg-foreground hover:text-background sm:[&:not(:nth-child(2n))]:border-r-0 lg:[&:not(:nth-child(3n))]:border-r-2"
            >
              <IconCircle icon={pillar.icon} className="group-hover:border-background group-hover:bg-background group-hover:text-foreground" />
              <h3 className="font-display mt-6 text-xl font-semibold">{pillar.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed opacity-80">{pillar.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <SectionRule variant="thick" />

      <Section eyebrow="Early detection" title="Conflicts caught before commit" subtitle="Neither decision injects as authoritative until someone resolves it.">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <ConflictAlert />
          <DecisionTimeline />
        </div>
      </Section>

      <SectionRule variant="ultra" />

      <section className="bg-foreground py-24 text-background md:py-32">
        <Container className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-background/50">Ready when you are</p>
          <h2 className="font-display mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Load your team&apos;s decisions in one command.
          </h2>
          <p className="mx-auto mt-6 max-w-lg font-body text-lg text-background/75">
            Run{" "}
            <code className="border border-background/30 px-1 font-mono text-sm">groundwork status</code>{" "}
            after init to see the graph.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <InstallBlock inverted />
          </div>
        </Container>
      </section>
    </>
  );
}
