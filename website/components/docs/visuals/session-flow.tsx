const STEPS = [
  { phase: "groundwork init", detail: "Scan CLAUDE.md, Prisma, git, CI — 28 decisions loaded", time: "0:00" },
  { phase: "MCP connect", detail: "groundwork_get_decisions available in Claude / Cursor", time: "0:30" },
  { phase: "You work", detail: "AI checks intent, records decisions, writes code", time: "0:31–2:40" },
  { phase: "Propagate", detail: "New nodes visible to teammates on next MCP call", time: "2:41" },
  { phase: "PR check", detail: "GitHub Action validates diff against P0 decisions", time: "on push" },
];

export function SessionFlowVisual() {
  return (
    <figure className="border-2 border-foreground bg-background">
      <figcaption className="border-b-2 border-foreground bg-muted px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Typical team workflow · automatic pipeline
      </figcaption>
      <div className="relative p-6 md:p-8">
        <div className="absolute bottom-8 left-8 top-8 w-0.5 bg-border-light" aria-hidden />
        <div className="space-y-6 pl-6">
          {STEPS.map((s) => (
            <div key={s.phase} className="relative">
              <div className="absolute -left-6 top-2 h-3 w-3 border-2 border-foreground bg-background" aria-hidden />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.time}</span>
              <div className="mt-2 border-2 border-foreground p-4 transition-colors duration-100 hover:bg-foreground hover:text-background">
                <p className="font-display text-lg font-semibold">{s.phase}</p>
                <p className="mt-1 font-body text-sm opacity-80">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
