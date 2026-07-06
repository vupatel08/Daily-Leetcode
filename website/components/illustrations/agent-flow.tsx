/** Agents converging into shared decision graph */
export function AgentFlowIllustration() {
  const agents = ["Claude", "Cursor", "Codex", "Hermes", "pi", "OpenClaw"];
  return (
    <svg viewBox="0 0 400 320" className="w-full" role="img" aria-label="Six agents connected to Hivemind">
      {/* Agent boxes top row */}
      {agents.map((name, i) => {
        const x = 12 + (i % 3) * 128;
        const y = i < 3 ? 20 : 72;
        return (
          <g key={name}>
            <rect x={x} y={y} width="108" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
            <text
              x={x + 54}
              y={y + 22}
              textAnchor="middle"
              className="fill-foreground font-mono text-[9px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-jetbrains), monospace" }}
            >
              {name}
            </text>
            <line
              x1={x + 54}
              y1={y + 36}
              x2={200}
              y2={200}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border-light"
            />
          </g>
        );
      })}
      {/* Center hub */}
      <rect x="120" y="200" width="160" height="56" fill="currentColor" className="text-foreground" />
      <text
        x="200"
        y="224"
        textAnchor="middle"
        className="fill-background font-mono text-[10px] uppercase tracking-widest"
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        HIVEMIND
      </text>
      <text
        x="200"
        y="242"
        textAnchor="middle"
        className="fill-background/70 font-mono text-[8px]"
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        decision graph
      </text>
      {/* Output arrows */}
      <line x1="200" y1="256" x2="200" y2="290" stroke="currentColor" strokeWidth="2" className="text-foreground" />
      <polygon points="200,298 194,286 206,286" fill="currentColor" className="text-foreground" />
      <text
        x="200"
        y="314"
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[8px] uppercase"
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        inject · detect · capture
      </text>
    </svg>
  );
}
