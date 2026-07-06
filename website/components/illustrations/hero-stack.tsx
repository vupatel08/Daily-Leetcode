/** Vertical stack diagram — where Groundwork sits between agents and the team graph */
export function HeroStackIllustration() {
  const agents = ["Claude", "Cursor", "Codex"];
  const mono = { fontFamily: "var(--font-jetbrains), monospace" } as const;

  return (
    <figure className="border-2 border-foreground bg-background">
      <svg
        viewBox="0 0 420 520"
        className="w-full"
        role="img"
        aria-labelledby="hero-stack-title hero-stack-desc"
      >
        <title id="hero-stack-title">Where Groundwork sits in your stack</title>
        <desc id="hero-stack-desc">
          AI agents connect through Groundwork MCP to a shared team decision graph. Scans
          capture upward; active constraints inject back down.
        </desc>

        {/* Layer 1 — agents */}
        <rect x="24" y="24" width="372" height="96" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
        <text x="210" y="48" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px] uppercase tracking-[0.2em]" style={mono}>
          Your AI assistants
        </text>
        {agents.map((name, i) => {
          const x = 48 + i * 112;
          return (
            <g key={name}>
              <rect x={x} y="58" width="96" height="44" fill="var(--muted)" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
              <text x={x + 48} y="86" textAnchor="middle" className="fill-foreground font-mono text-[10px] uppercase tracking-wider" style={mono}>
                {name}
              </text>
            </g>
          );
        })}
        <text x="372" y="86" textAnchor="end" className="fill-muted-foreground font-mono text-[9px]" style={mono}>
          +3
        </text>

        {/* Capture arrow down */}
        <line x1="210" y1="120" x2="210" y2="152" stroke="currentColor" strokeWidth="2" className="text-foreground" />
        <polygon points="210,160 204,148 216,148" fill="currentColor" className="text-foreground" />
        <text x="248" y="142" className="fill-foreground font-mono text-[8px] uppercase tracking-wider" style={mono}>
          capture
        </text>
        <text x="248" y="154" className="fill-muted-foreground font-mono text-[7px]" style={mono}>
          session traces
        </text>

        {/* Layer 2 — Groundwork (center) */}
        <rect x="24" y="168" width="372" height="112" fill="#000000" stroke="none" />
        <text x="210" y="200" textAnchor="middle" fill="#ffffff" className="font-mono text-[11px] uppercase tracking-[0.25em]" style={mono}>
          Groundwork
        </text>
        <text x="210" y="222" textAnchor="middle" fill="rgba(255,255,255,0.7)" className="font-mono text-[8px] uppercase tracking-wider" style={mono}>
          hooks · extract · inject · detect
        </text>
        <line x1="48" y1="238" x2="372" y2="238" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <text x="210" y="258" textAnchor="middle" fill="rgba(255,255,255,0.85)" className="font-body text-[11px]" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
          The layer between agents and team memory
        </text>

        {/* Bidirectional sync */}
        <line x1="210" y1="280" x2="210" y2="312" stroke="currentColor" strokeWidth="2" className="text-foreground" />
        <polygon points="210,320 204,308 216,308" fill="currentColor" className="text-foreground" />
        <line x1="168" y1="296" x2="132" y2="296" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
        <polygon points="124,296 136,290 136,302" fill="currentColor" className="text-foreground" />
        <text x="108" y="290" textAnchor="end" className="fill-foreground font-mono text-[8px] uppercase tracking-wider" style={mono}>
          inject
        </text>
        <text x="108" y="312" textAnchor="end" className="fill-muted-foreground font-mono text-[7px]" style={mono}>
          active constraints
        </text>

        {/* Layer 3 — shared graph */}
        <rect x="24" y="328" width="372" height="168" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground" />
        <text x="210" y="352" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px] uppercase tracking-[0.2em]" style={mono}>
          Shared decision graph
        </text>

        {/* Mini decision nodes */}
        <g>
          <rect x="40" y="368" width="156" height="52" fill="var(--status-active-bg)" stroke="var(--status-active)" strokeWidth="1.5" />
          <text x="52" y="386" className="font-mono text-[7px] uppercase tracking-wider" fill="var(--status-active)" style={mono}>
            Active
          </text>
          <text x="52" y="404" className="fill-foreground font-mono text-[8px]" style={mono}>
            D004 · UUID user IDs
          </text>
          <text x="52" y="416" className="fill-muted-foreground font-mono text-[7px]" style={mono}>
            @alice · schema
          </text>
        </g>

        <g>
          <rect x="224" y="368" width="156" height="52" fill="var(--status-conflicted-bg)" stroke="var(--status-conflicted)" strokeWidth="1.5" />
          <text x="236" y="386" className="font-mono text-[7px] uppercase tracking-wider" fill="var(--status-conflicted)" style={mono}>
            Conflicted
          </text>
          <text x="236" y="404" className="fill-foreground font-mono text-[8px]" style={mono}>
            D112 · integer IDs
          </text>
          <text x="236" y="416" className="fill-muted-foreground font-mono text-[7px]" style={mono}>
            flagged before PR
          </text>
        </g>

        <line x1="40" y1="436" x2="380" y2="436" stroke="currentColor" strokeWidth="1" className="text-border-light" strokeDasharray="4 4" />
        <text x="210" y="458" textAnchor="middle" className="fill-muted-foreground font-mono text-[8px] uppercase tracking-wider" style={mono}>
          full history · supersede · dispute
        </text>
        <text x="210" y="478" textAnchor="middle" className="fill-muted-foreground font-body text-[10px]" style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
          Same graph for every agent on the team
        </text>

        {/* Codebase anchor */}
        <line x1="48" y1="492" x2="372" y2="492" stroke="currentColor" strokeWidth="1" className="text-border-light" />
        <text x="210" y="510" textAnchor="middle" className="fill-muted-foreground font-mono text-[7px] uppercase tracking-[0.15em]" style={mono}>
          your repo · same agents · new shared layer
        </text>
      </svg>
      <figcaption className="border-t-2 border-foreground px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Agents stay the same. Groundwork adds the shared layer.
      </figcaption>
    </figure>
  );
}
