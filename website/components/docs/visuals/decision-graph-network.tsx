import { STATUS_COLORS } from "@/components/ui/status-badge";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status?: keyof typeof STATUS_COLORS;
  module?: boolean;
}

const NODES: GraphNode[] = [
  { id: "D004", label: "UUID user IDs", x: 120, y: 80, status: "ACTIVE" },
  { id: "D005", label: "Prisma ORM", x: 320, y: 80, status: "ACTIVE" },
  { id: "D112", label: "INTEGER user_id", x: 120, y: 220, status: "CONFLICTED" },
  { id: "D006", label: "Redis sessions", x: 320, y: 220, status: "ACTIVE" },
  { id: "D003", label: "REST v1", x: 520, y: 150, status: "SUPERSEDED" },
  { id: "auth", label: "auth module", x: 220, y: 340, module: true },
];

const EDGES = [
  { from: "D004", to: "D112", label: "CONFLICTS_WITH", color: STATUS_COLORS.CONFLICTED.border },
  { from: "D004", to: "auth", label: "AFFECTS_MODULE", color: "#000" },
  { from: "D112", to: "auth", label: "AFFECTS_MODULE", color: "#737373" },
  { from: "D003", to: "D005", label: "SUPERSEDES", color: STATUS_COLORS.SUPERSEDED.border, dashed: true },
  { from: "D005", to: "D006", label: "DEPENDS_ON", color: "#525252" },
];

export function DecisionGraphNetwork() {
  const pos = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <figure className="border-2 border-foreground bg-background">
      <figcaption className="border-b-2 border-foreground bg-muted px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Graph edges · sample project acme-api
      </figcaption>
      <svg viewBox="0 0 640 400" className="w-full" role="img" aria-label="Decision graph network with nodes and typed edges">
        {EDGES.map((e) => {
          const a = pos[e.from];
          const b = pos[e.to];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          return (
            <g key={`${e.from}-${e.to}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={e.color}
                strokeWidth="1.5"
                strokeDasharray={e.dashed ? "5 4" : undefined}
              />
              <text
                x={mx}
                y={my - 6}
                textAnchor="middle"
                fill="#525252"
                fontSize="7"
                fontFamily="var(--font-jetbrains), monospace"
              >
                {e.label}
              </text>
            </g>
          );
        })}
        {NODES.map((n) => {
          const colors = n.module
            ? { bg: "#f5f5f5", border: "#000000", text: "#000000" }
            : STATUS_COLORS[n.status ?? "ACTIVE"];
          const w = n.module ? 100 : 88;
          const h = 36;
          return (
            <g key={n.id}>
              <rect
                x={n.x - w / 2}
                y={n.y - h / 2}
                width={w}
                height={h}
                fill={colors.bg}
                stroke={colors.border}
                strokeWidth="1.5"
              />
              <text
                x={n.x}
                y={n.y - 4}
                textAnchor="middle"
                fill={colors.text}
                fontSize="8"
                fontFamily="var(--font-jetbrains), monospace"
              >
                {n.id}
              </text>
              <text
                x={n.x}
                y={n.y + 10}
                textAnchor="middle"
                fill="#525252"
                fontSize="7"
                fontFamily="var(--font-jetbrains), monospace"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 border-t-2 border-foreground px-5 py-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <span>CONFLICTS_WITH</span>
        <span>SUPERSEDES</span>
        <span>AFFECTS_MODULE</span>
        <span>DEPENDS_ON</span>
      </div>
    </figure>
  );
}
