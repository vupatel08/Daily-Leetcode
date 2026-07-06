import { InjectionTerminal } from "@/components/demos/injection-terminal";

export function InjectionPreview() {
  return (
    <figure>
      <InjectionTerminal />
      <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Injected at session start · only active decisions · domain-matched
      </figcaption>
    </figure>
  );
}
