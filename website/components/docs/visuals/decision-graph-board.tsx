import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusKey } from "@/components/ui/status-badge";

interface Card {
  id: string;
  title: string;
  domain: string;
  author: string;
  detail: string;
}

interface Column {
  badge: StatusKey | "PROPOSED";
  label: string;
  cards: Card[];
}

const COLUMNS: Column[] = [
  {
    badge: "ACTIVE",
    label: "Active · injects",
    cards: [
      { id: "D004", title: "UUID v4 user IDs", domain: "schema", author: "@alice", detail: "P0 · server-generated" },
      { id: "D005", title: "Prisma ORM only", domain: "tooling", author: "@bob", detail: "P1 · no raw SQL" },
      { id: "D006", title: "Redis session store", domain: "architecture", author: "@marcus", detail: "P1 · 24h TTL" },
    ],
  },
  {
    badge: "PROPOSED",
    label: "Proposed · needs approval",
    cards: [
      { id: "D091", title: "Evaluate Drizzle ORM", domain: "tooling", author: "@extractor", detail: "confidence 0.82" },
      { id: "D088", title: "Snake_case JSON keys", domain: "naming", author: "@extractor", detail: "confidence 0.79" },
    ],
  },
  {
    badge: "CONFLICTED",
    label: "Conflicted · blocked",
    cards: [
      { id: "D112", title: "INTEGER billing.user_id", domain: "schema", author: "@priya", detail: "vs D004 UUID" },
    ],
  },
  {
    badge: "SUPERSEDED",
    label: "Superseded · history",
    cards: [
      { id: "D003", title: "REST API v1 only", domain: "api", author: "@alice", detail: "→ D044 tRPC" },
      { id: "D021", title: "Mongo for users", domain: "schema", author: "@bob", detail: "→ D004 Postgres UUID" },
    ],
  },
];

export function DecisionGraphBoard() {
  return (
    <figure className="border-2 border-foreground bg-background">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground bg-foreground px-5 py-3 text-background">
        <span className="font-mono text-[10px] uppercase tracking-widest">Decision graph · sample project</span>
        <span className="font-mono text-[10px] text-background/60">groundwork status</span>
      </figcaption>
      <div className="grid gap-0 overflow-x-auto lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.label} className="min-w-[220px] border-b-2 border-foreground lg:border-b-0 lg:[&:not(:last-child)]:border-r-2">
            <div className="border-b-2 border-foreground bg-muted px-4 py-3">
              {col.badge === "PROPOSED" ? (
                <span className="inline-flex items-center gap-1.5 border border-[#6366f1] bg-[#eef2ff] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#4338ca]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366f1]" />
                  Proposed
                </span>
              ) : (
                <StatusBadge status={col.badge} />
              )}
              <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{col.label}</p>
            </div>
            <div className="space-y-0">
              {col.cards.map((card) => (
                <div key={card.id} className="border-b border-border-light p-4 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs">{card.id}</span>
                    <span className="font-mono text-[9px] uppercase text-muted-foreground">{card.domain}</span>
                  </div>
                  <p className="font-display mt-2 text-base font-semibold leading-snug">{card.title}</p>
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">{card.author}</p>
                  <p className="mt-1 font-body text-xs text-muted-foreground">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
