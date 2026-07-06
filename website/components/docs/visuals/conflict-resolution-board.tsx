import { ConflictAlert } from "@/components/demos/conflict-alert";

export function ConflictResolutionBoard() {
  return (
    <figure className="space-y-6">
      <ConflictAlert />
      <div className="border-2 border-foreground bg-muted p-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Resolution options</p>
        <pre className="mt-4 overflow-x-auto font-mono text-sm leading-relaxed">
{`# Supersede the wrong decision (via MCP or manual graph update)
groundwork scan

# PR enforcement blocks until fixed
# fix billing.user_id → UUID, push, Action re-runs`}
        </pre>
      </div>
    </figure>
  );
}
