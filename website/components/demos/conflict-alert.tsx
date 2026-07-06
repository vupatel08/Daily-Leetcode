import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { STATUS_COLORS } from "@/components/ui/status-badge";

export function ConflictAlert() {
  return (
    <div
      className="border-4 bg-background p-6 md:p-8"
      style={{ borderColor: STATUS_COLORS.CONFLICTED.border }}
    >
      <div className="flex items-start gap-5">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center border-2"
          style={{ borderColor: STATUS_COLORS.CONFLICTED.border, backgroundColor: STATUS_COLORS.CONFLICTED.bg }}
        >
          <AlertTriangle size={20} strokeWidth={1.5} style={{ color: STATUS_COLORS.CONFLICTED.text }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="CONFLICTED" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Tuesday 11:30 AM
            </span>
          </div>
          <h3 className="font-display mt-4 text-2xl font-semibold tracking-tight">
            billing.user_id type mismatch
          </h3>
          <p className="mt-3 font-body text-base leading-relaxed text-muted-foreground">
            New extraction:{" "}
            <code
              className="border px-1 font-mono text-sm"
              style={{
                borderColor: STATUS_COLORS.CONFLICTED.border,
                backgroundColor: STATUS_COLORS.CONFLICTED.bg,
                color: STATUS_COLORS.CONFLICTED.text,
              }}
            >
              billing.user_id = INTEGER
            </code>
            . Active constraint D004 says user IDs are UUID v4 strings. Neither decision injects
            as authoritative until resolved.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className="border px-2 py-1 font-mono text-[10px] uppercase tracking-wider"
              style={{
                borderColor: STATUS_COLORS.ACTIVE.border,
                backgroundColor: STATUS_COLORS.ACTIVE.bg,
                color: STATUS_COLORS.ACTIVE.text,
              }}
            >
              D004 · Schema · @alice
            </span>
            <span
              className="border px-2 py-1 font-mono text-[10px] uppercase tracking-wider"
              style={{
                borderColor: STATUS_COLORS.CONFLICTED.border,
                backgroundColor: STATUS_COLORS.CONFLICTED.bg,
                color: STATUS_COLORS.CONFLICTED.text,
              }}
            >
              D112 · Schema · @priya
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
