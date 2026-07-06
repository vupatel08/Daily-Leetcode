const DOMAINS = ["schema", "architecture", "api", "tooling", "naming", "pattern", "config"];
const PRIORITIES = [
  { key: "P0", label: "Always inject", examples: ["PK format", "Auth model", "API versioning"] },
  { key: "P1", label: "Domain match", examples: ["ORM choice", "Cache layer", "Error shape"] },
  { key: "P2", label: "On request", examples: ["File naming", "Comment style", "Test layout"] },
  { key: "P3", label: "Archive", examples: ["Deprecated patterns", "Old tooling"] },
];

export function TaxonomyMatrix() {
  return (
    <figure className="border-2 border-foreground bg-background overflow-x-auto">
      <figcaption className="border-b-2 border-foreground bg-muted px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Decision taxonomy · domain × priority
      </figcaption>
      <table className="w-full min-w-[640px] border-collapse font-body text-sm">
        <thead>
          <tr className="border-b-2 border-foreground bg-foreground text-background">
            <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Priority</th>
            {DOMAINS.map((d) => (
              <th key={d} className="px-3 py-3 text-left font-mono text-[9px] uppercase tracking-wider">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PRIORITIES.map((p, pi) => (
            <tr key={p.key} className="border-b border-border-light">
              <td className="border-r-2 border-foreground bg-muted px-4 py-4 align-top">
                <span className="font-mono text-xs font-semibold">{p.key}</span>
                <p className="mt-1 font-body text-xs text-muted-foreground">{p.label}</p>
              </td>
              {DOMAINS.map((d, di) => {
                const sample = p.examples[di % p.examples.length];
                const hot = p.key === "P0" || (p.key === "P1" && di < 4);
                return (
                  <td
                    key={d}
                    className={`px-3 py-3 align-top text-xs ${hot ? "bg-foreground/5 font-medium" : "text-muted-foreground"}`}
                  >
                    {hot ? sample : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
