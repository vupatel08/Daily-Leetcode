export function InjectionTerminal() {
  const lines = [
    { prompt: false, text: "[GROUNDWORK PROJECT CONTEXT — active decisions relevant to this session]" },
    { prompt: false, text: "" },
    { prompt: false, text: "SCHEMA: User IDs are UUID v4 strings, server-generated. Never integer IDs or" },
    { prompt: false, text: "email as primary key. (D004, @alice, decided 2026-01-13)" },
    { prompt: false, text: "" },
    { prompt: false, text: "TOOLING: ORM is Prisma. No raw SQL in application code. (D005, @bob)" },
    { prompt: false, text: "" },
    { prompt: false, text: "If your work touches these areas, treat them as non-negotiable unless you raise" },
    { prompt: false, text: "a conflict through Groundwork." },
    { prompt: false, text: "" },
    { prompt: true, text: "Help me wire up billing schema for subscriptions" },
  ];

  return (
    <div className="border-2 border-foreground bg-foreground text-background">
      <div className="flex items-center justify-between border-b-2 border-background/20 px-5 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-background/60">
          Cursor — billing-module
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest">Live injection</span>
      </div>
      <pre className="overflow-x-auto p-6 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className={line.prompt ? "text-background" : "text-background/85"}>
            {line.prompt && <span className="text-background/50">&gt; </span>}
            {line.text}
          </div>
        ))}
      </pre>
    </div>
  );
}
