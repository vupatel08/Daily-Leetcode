import { CodebaseGraphIllustration } from "@/components/illustrations/codebase-graph";

const KPIS = [
  { label: "Sessions captured", value: "1,284" },
  { label: "Active decisions", value: "12" },
  { label: "Conflicts open", value: "2" },
  { label: "Skills shared", value: "8" },
  { label: "Tokens saved", value: "340k" },
  { label: "Graph symbols", value: "1,247" },
];

export function CodebaseDashboardPreview() {
  return (
    <figure className="border-2 border-foreground bg-background">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-foreground bg-foreground px-5 py-3 text-background">
        <span className="font-mono text-[10px] uppercase tracking-widest">groundwork dashboard · sample project</span>
        <span className="font-mono text-[10px] text-background/60">localhost:4000</span>
      </figcaption>
      <div className="grid gap-0 border-b-2 border-foreground sm:grid-cols-3 lg:grid-cols-6">
        {KPIS.map((k) => (
          <div key={k.label} className="border-b-2 border-foreground p-4 sm:border-b-0 sm:[&:not(:last-child)]:border-r-2">
            <p className="font-display text-2xl font-semibold tracking-tight">{k.value}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-0 lg:grid-cols-2">
        <div className="border-b-2 border-foreground p-6 lg:border-b-0 lg:border-r-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Codebase graph</p>
          <div className="mt-4">
            <CodebaseGraphIllustration />
          </div>
        </div>
        <div className="p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recent agent paths</p>
          <ul className="mt-4 space-y-3 font-mono text-xs">
            <li className="border-l-2 border-foreground pl-3">@alice · auth.ts → user.ts → session.ts</li>
            <li className="border-l-2 border-foreground pl-3">@priya · billing/schema.sql → subscriptions.ts</li>
            <li className="border-l-2 border-foreground pl-3">@marcus · search/index.ts → elasticsearch.ts</li>
          </ul>
        </div>
      </div>
    </figure>
  );
}
