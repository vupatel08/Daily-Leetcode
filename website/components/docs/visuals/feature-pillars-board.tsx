import { Scan, GitBranch, Shield, Share2, Gavel, LayoutDashboard } from "lucide-react";
import { IconCircle } from "@/components/ui/icon-circle";

const PILLARS = [
  { icon: Scan, title: "Onboarding scan", stat: "28 nodes", detail: "init · CLAUDE.md + Prisma + git" },
  { icon: GitBranch, title: "Decision graph", stat: "typed edges", detail: "SUPERSEDES · CONFLICTS_WITH" },
  { icon: Share2, title: "MCP propagation", stat: "4 tools", detail: "get_decisions · record_decision" },
  { icon: Shield, title: "Conflict detection", stat: "2 open", detail: "D112 vs D004 flagged" },
  { icon: Gavel, title: "PR enforcement", stat: "P0 block", detail: "GitHub Action on every PR" },
  { icon: LayoutDashboard, title: "Dashboard", stat: ":4000", detail: "graph · timeline · conflicts" },
];

export function FeaturePillarsBoard() {
  return (
    <figure className="border-2 border-foreground bg-background">
      <figcaption className="border-b-2 border-foreground bg-muted px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Groundwork · sample project · after groundwork init
      </figcaption>
      <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="border-b-2 border-foreground p-6 sm:[&:nth-child(odd)]:border-r-2 lg:[&:nth-child(3n+1)]:border-r-2 lg:[&:nth-child(3n+2)]:border-r-2 lg:[&:nth-last-child(-n+3)]:border-b-0"
          >
            <IconCircle icon={p.icon} />
            <h3 className="font-display mt-4 text-lg font-semibold">{p.title}</h3>
            <p className="mt-2 font-mono text-sm text-foreground">{p.stat}</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">{p.detail}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
