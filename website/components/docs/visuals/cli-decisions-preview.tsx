export function CliDecisionsPreview() {
  const output = `$ groundwork status

Groundwork Decision Graph

  [P0] User IDs are UUID v4 strings     (Schema, ACTIVE)
  [P0] Bearer JWT in Authorization      (Authentication, ACTIVE)
  [P1] Prisma ORM only                  (Tooling, ACTIVE)
  [P1] Redis session store              (Infrastructure, ACTIVE)
  [P2] camelCase JSON responses         (API, ACTIVE)
  [P1] INTEGER billing.user_id          (Schema, DISPUTED)

1 unresolved conflict(s):
  ⚠️  billing.user_id type mismatch vs D004 UUID constraint`;

  return (
    <figure className="border-2 border-foreground bg-foreground text-background">
      <figcaption className="border-b-2 border-background/20 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-background/60">
        CLI · sample output (fake data)
      </figcaption>
      <pre className="overflow-x-auto p-6 font-mono text-[12px] leading-relaxed text-background/90">{output}</pre>
    </figure>
  );
}
