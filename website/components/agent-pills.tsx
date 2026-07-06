const AGENTS = ["Claude Code", "Cursor", "Windsurf", "GitHub Copilot", "MCP tools"];

export function AgentPills() {
  return (
    <div className="flex flex-wrap justify-center gap-0 border-2 border-foreground">
      {AGENTS.map((agent) => (
        <span
          key={agent}
          className="border-foreground px-4 py-3 font-mono text-xs uppercase tracking-widest md:px-6 md:py-4 md:text-sm [&:not(:last-child)]:border-r-2"
        >
          {agent}
        </span>
      ))}
    </div>
  );
}
