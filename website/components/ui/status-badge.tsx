/** Muted signal colors — small pop on monochrome base */
export const STATUS_COLORS = {
  ACTIVE: { bg: "#ecfdf5", border: "#059669", text: "#047857", dot: "#10b981" },
  DISPUTED: { bg: "#fffbeb", border: "#d97706", text: "#b45309", dot: "#f59e0b" },
  CONFLICTED: { bg: "#fef2f2", border: "#dc2626", text: "#b91c1c", dot: "#ef4444" },
  SUPERSEDED: { bg: "#f5f5f5", border: "#737373", text: "#525252", dot: "#a3a3a3" },
} as const;

export type StatusKey = keyof typeof STATUS_COLORS;

interface StatusBadgeProps {
  status: StatusKey;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${className}`}
      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: c.dot }} />
      {status}
    </span>
  );
}
