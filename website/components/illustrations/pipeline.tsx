/** Capture → Extract → Inject → Detect pipeline */
export function PipelineIllustration() {
  const steps = ["Capture", "Extract", "Inject", "Detect"];
  return (
    <svg viewBox="0 0 560 80" className="w-full max-w-lg" role="img" aria-label="Hivemind pipeline">
      {steps.map((step, i) => {
        const x = i * 140;
        return (
          <g key={step}>
            <rect
              x={x + 8}
              y="16"
              width="112"
              height="48"
              fill={i === 2 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              className={i === 2 ? "text-foreground" : "text-foreground"}
            />
            <text
              x={x + 64}
              y="46"
              textAnchor="middle"
              className={i === 2 ? "fill-background font-mono text-[10px] uppercase tracking-widest" : "fill-foreground font-mono text-[10px] uppercase tracking-widest"}
              style={{ fontFamily: "var(--font-jetbrains), monospace" }}
            >
              {step}
            </text>
            {i < steps.length - 1 && (
              <>
                <line x1={x + 120} y1="40" x2={x + 140} y2="40" stroke="currentColor" strokeWidth="2" className="text-foreground" />
                <polygon points={`${x + 140},40 ${x + 132},36 ${x + 132},44`} fill="currentColor" className="text-foreground" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
