/** Codebase graph — files, symbols, edges */
export function CodebaseGraphIllustration() {
  const nodes = [
    { id: "auth", label: "auth.ts", x: 200, y: 40, kind: "module" },
    { id: "login", label: "login()", x: 80, y: 120, kind: "fn" },
    { id: "session", label: "Session", x: 200, y: 120, kind: "class" },
    { id: "jwt", label: "verifyJwt", x: 320, y: 120, kind: "fn" },
    { id: "user", label: "UserRepo", x: 140, y: 200, kind: "class" },
    { id: "api", label: "/api/auth", x: 260, y: 200, kind: "route" },
  ];
  const edges = [
    ["auth", "login"],
    ["auth", "session"],
    ["auth", "jwt"],
    ["session", "user"],
    ["jwt", "api"],
    ["user", "api"],
  ];
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 400 260" className="w-full" role="img" aria-label="Codebase graph with auth module connections">
      {edges.map(([from, to]) => {
        const a = pos[from];
        const b = pos[to];
        return (
          <line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border-light"
          />
        );
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="6" fill="currentColor" className="text-foreground" />
          <text
            x={n.x}
            y={n.y + 22}
            textAnchor="middle"
            className="fill-foreground font-mono text-[9px]"
            style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
            {n.label}
          </text>
        </g>
      ))}
      <text
        x="200"
        y="248"
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[8px] uppercase tracking-widest"
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        groundwork dashboard
      </text>
    </svg>
  );
}
