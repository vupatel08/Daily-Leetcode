import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { STATUS_COLORS } from "@/components/ui/status-badge";

/** Horizontal git-style lane — UUID → DISPUTED → ULID over time */
export function DecisionLaneDiagram() {
  return (
    <svg
      viewBox="0 0 720 200"
      className="w-full"
      role="img"
      aria-label="Decision lifecycle: UUID active, then disputed, then superseded by ULID"
    >
      <text x="0" y="18" fill="#000" fontSize="11" fontFamily="var(--font-jetbrains), monospace">
        Time →
      </text>
      {["Jan", "Feb", "Mar", "Apr"].map((m, i) => (
        <text key={m} x={80 + i * 180} y="42" fill="#525252" fontSize="10" fontFamily="var(--font-jetbrains), monospace">
          {m}
        </text>
      ))}
      <line x1="0" y1="48" x2="720" y2="48" stroke="#e5e5e5" strokeWidth="1" />

      <text x="0" y="78" fill="#000" fontSize="10" fontFamily="var(--font-jetbrains), monospace">D004</text>
      <text x="36" y="78" fill="#525252" fontSize="10" fontFamily="var(--font-jetbrains), monospace">UUID IDs</text>
      <line x1="100" y1="74" x2="380" y2="74" stroke={STATUS_COLORS.ACTIVE.dot} strokeWidth="3" />
      <line x1="380" y1="74" x2="380" y2="108" stroke="#000" strokeWidth="2" />

      <line x1="380" y1="108" x2="520" y2="108" stroke={STATUS_COLORS.DISPUTED.border} strokeWidth="2" strokeDasharray="6 4" />
      <rect x="400" y="96" width="72" height="18" fill={STATUS_COLORS.DISPUTED.bg} stroke={STATUS_COLORS.DISPUTED.border} strokeWidth="1.5" />
      <text x="406" y="109" fill={STATUS_COLORS.DISPUTED.text} fontSize="8" fontFamily="var(--font-jetbrains), monospace">DISPUTED</text>

      <text x="0" y="148" fill="#000" fontSize="10" fontFamily="var(--font-jetbrains), monospace">D087</text>
      <text x="36" y="148" fill="#525252" fontSize="10" fontFamily="var(--font-jetbrains), monospace">ULID IDs</text>
      <line x1="440" y1="144" x2="700" y2="144" stroke={STATUS_COLORS.ACTIVE.dot} strokeWidth="4" />
      <rect x="620" y="132" width="56" height="18" fill={STATUS_COLORS.ACTIVE.border} />
      <text x="628" y="145" fill="#fff" fontSize="8" fontFamily="var(--font-jetbrains), monospace">ACTIVE</text>

      <line x1="520" y1="108" x2="440" y2="144" stroke="#737373" strokeWidth="1.5" />
      <text x="468" y="128" fill={STATUS_COLORS.SUPERSEDED.text} fontSize="8" fontFamily="var(--font-jetbrains), monospace">SUPERSEDED</text>

      <circle cx="380" cy="74" r="5" fill={STATUS_COLORS.ACTIVE.dot} />
      <circle cx="440" cy="144" r="5" fill={STATUS_COLORS.ACTIVE.dot} />
    </svg>
  );
}

const EVENTS = [
  {
    id: "D004",
    label: "UUID v4 for user IDs",
    status: "ACTIVE" as const,
    period: "Jan 13 → Mar 2",
    detail: "@alice · schema constraint",
  },
  {
    id: "D004",
    label: "UUID v4 disputed",
    status: "DISPUTED" as const,
    period: "Mar 2 → Mar 8",
    detail: "ULID proposal challenged existing format",
  },
  {
    id: "D087",
    label: "ULID for user IDs",
    status: "ACTIVE" as const,
    period: "Mar 8 → present",
    detail: "Supersedes D004 · injects now",
  },
];

export function DecisionTimeline() {
  return (
    <div className="border-2 border-foreground bg-background">
      <div className="border-b-2 border-foreground bg-muted p-6 md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Decision lifecycle
        </p>
        <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          User ID format over time
        </h3>
        <div className="mt-8">
          <DecisionLaneDiagram />
        </div>
      </div>

      <div className="relative p-6 md:p-8">
        <div
          className="absolute bottom-8 left-[1.125rem] top-8 w-0.5 bg-border-light md:left-1/2 md:-translate-x-px"
          aria-hidden
        />

        <div className="space-y-10 pl-8 md:pl-0">
          {EVENTS.map((item, i) => {
            const isLeft = i % 2 === 0;
            const dotColor = STATUS_COLORS[item.status].dot;
            return (
              <div
                key={`${item.id}-${item.status}-${i}`}
                className="relative grid grid-cols-1 md:grid-cols-2 md:items-center md:gap-8"
              >
                <div
                  className="absolute -left-8 top-8 h-3 w-3 border-2 border-foreground md:hidden"
                  style={{ backgroundColor: dotColor }}
                  aria-hidden
                />

                <div className={cn("md:pr-12", !isLeft && "md:order-2 md:pl-12 md:pr-0")}>
                  <div
                    className={cn(
                      "border-2 border-foreground p-5 transition-colors duration-100 hover:bg-foreground hover:text-background",
                      isLeft ? "md:text-right" : "",
                    )}
                  >
                    <div className={cn("flex flex-wrap items-center gap-2", isLeft && "md:justify-end")}>
                      <span className="font-mono text-xs">{item.id}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="font-display mt-3 text-xl font-semibold">{item.label}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest opacity-70">
                      {item.period}
                    </p>
                    <p className="mt-2 font-body text-sm opacity-80">{item.detail}</p>
                  </div>
                </div>

                <div
                  className="absolute left-4 top-1/2 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 border-2 border-foreground md:block md:left-1/2"
                  style={{ backgroundColor: dotColor }}
                  aria-hidden
                />

                <div className={cn("hidden md:block", isLeft ? "md:order-2" : "")} />
              </div>
            );
          })}
        </div>

        <p className="mt-10 border-t-2 border-foreground pt-6 font-body text-sm leading-relaxed text-muted-foreground">
          History never disappears. Only{" "}
          <strong style={{ color: STATUS_COLORS.ACTIVE.text }}>ACTIVE</strong> decisions inject.
          Supersede links forward; dispute pauses injection until resolved.
        </p>
      </div>
    </div>
  );
}
