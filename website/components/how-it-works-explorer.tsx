"use client";

import { useState } from "react";
import { InjectionTerminal } from "@/components/demos/injection-terminal";
import { ConflictAlert } from "@/components/demos/conflict-alert";
import { cn } from "@/lib/utils";

type StepId = "scan" | "extract" | "inject" | "enforce";

interface Step {
  id: StepId;
  num: string;
  title: string;
  tagline: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: "scan",
    num: "01",
    title: "Scan",
    tagline: "groundwork init reads your repo and loads decisions in seconds.",
    description:
      "On first run, Groundwork scans CLAUDE.md, package.json, Prisma schemas, git history, and CI config. Existing architectural choices become graph nodes — no cold start for new teammates.",
  },
  {
    id: "extract",
    num: "02",
    title: "Extract",
    tagline: "Session decisions and file changes become structured nodes.",
    description:
      "As developers work, the MCP server captures new decisions via groundwork_record_decision. Confidence gating keeps low-certainty extractions as PROPOSED until a human approves.",
  },
  {
    id: "inject",
    num: "03",
    title: "Inject",
    tagline: "groundwork_get_decisions prepends context before code is written.",
    description:
      "Your AI calls MCP tools before generating code. Active P0 decisions always inject; P1 decisions match on domain and module. Tuesday's session already knows Monday's UUID choice.",
  },
  {
    id: "enforce",
    num: "04",
    title: "Enforce",
    tagline: "P0 violations block the merge button on every PR.",
    description:
      "The GitHub Action diffs each PR against the decision graph. P0 conflicts fail the check; P1 violations warn. No P0 violation reaches main.",
  },
];

function ScanExample() {
  const lines = [
    { dim: true, text: "$ groundwork init" },
    { dim: false, text: "✔ Groundwork initialized — extracted 28 decisions" },
    { dim: true, text: "" },
    { dim: false, text: "  CLAUDE.md .............. 12 decisions" },
    { dim: false, text: "  prisma/schema.prisma ... 8 decisions" },
    { dim: false, text: "  package.json ......... 4 decisions" },
    { dim: false, text: "  git history ............ 4 decisions" },
    { dim: true, text: "→ written to .groundwork/decisions.json" },
  ];
  return (
    <div className="border-2 border-foreground bg-muted">
      <div className="border-b-2 border-foreground px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Example · onboarding scan</span>
      </div>
      <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={line.dim ? "text-muted-foreground" : "text-foreground"}>
            {line.text || "\u00A0"}
          </div>
        ))}
      </pre>
    </div>
  );
}

function ExtractExample() {
  const lines = [
    { dim: true, text: "MCP · groundwork_record_decision" },
    { dim: false, text: 'title: "User IDs are UUID v4 strings"' },
    { dim: false, text: "domain: Schema · priority: P0 · confidence: 0.94" },
    { dim: true, text: "→ node D004 · ACTIVE · propagated to team store" },
  ];
  return (
    <div className="border-2 border-foreground bg-muted">
      <div className="border-b-2 border-foreground px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Example · session capture</span>
      </div>
      <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={line.dim ? "text-muted-foreground" : "text-foreground"}>
            {line.text}
          </div>
        ))}
      </pre>
    </div>
  );
}

function EnforceExample() {
  const lines = [
    { dim: true, text: "GitHub Action · Groundwork Decision Check" },
    { dim: false, text: "PR #142 · billing/schema.sql" },
    { dim: false, text: "" },
    { dim: false, text: "✗ P0 VIOLATION · D004 UUID user IDs" },
    { dim: false, text: "  Added: billing.user_id INTEGER" },
    { dim: true, text: "→ merge blocked until resolved" },
  ];
  return (
    <div className="border-2 border-foreground bg-muted">
      <div className="border-b-2 border-foreground px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Example · PR enforcement</span>
      </div>
      <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={line.dim ? "text-muted-foreground" : "text-foreground"}>
            {line.text || "\u00A0"}
          </div>
        ))}
      </pre>
    </div>
  );
}

function StepExample({ id }: { id: StepId }) {
  switch (id) {
    case "scan":
      return <ScanExample />;
    case "extract":
      return <ExtractExample />;
    case "inject":
      return <InjectionTerminal />;
    case "enforce":
      return <EnforceExample />;
  }
}

export function HowItWorksExplorer() {
  const [active, setActive] = useState<StepId>("scan");
  const step = STEPS.find((s) => s.id === active)!;

  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
      <div className="grid gap-0 sm:grid-cols-2 sm:border-2 sm:border-foreground">
        {STEPS.map((s) => {
          const selected = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              aria-pressed={selected}
              className={cn(
                "border-2 border-foreground p-6 text-left transition-colors duration-100",
                "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-foreground focus-visible:outline-offset-[3px]",
                "sm:border-0 sm:[&:nth-child(odd)]:border-r-2 sm:[&:nth-child(-n+2)]:border-b-2",
                selected ? "bg-foreground text-background" : "hover:bg-foreground hover:text-background",
              )}
            >
              <span className={cn("font-mono text-xs", selected ? "text-background/60" : "text-muted-foreground")}>{s.num}</span>
              <h3 className="font-display mt-2 text-xl font-semibold">{s.title}</h3>
              <p className={cn("mt-3 font-body text-sm leading-relaxed", selected ? "text-background/85" : "opacity-80")}>{s.tagline}</p>
            </button>
          );
        })}
      </div>

      <div className="min-w-0">
        <p className="font-body text-base leading-relaxed text-muted-foreground">{step.description}</p>
        <div className="mt-8" key={step.id}>
          <StepExample id={step.id} />
        </div>
      </div>
    </div>
  );
}
