import { InjectionTerminal } from "@/components/demos/injection-terminal";
import { Container } from "@/components/ui/container";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Injection demo" };

export default function InjectionDemoPage() {
  return (
    <Container className="py-20 md:py-28">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Demo</p>
      <h1 className="font-display mt-4 text-4xl font-semibold">Injection preview</h1>
      <p className="mt-4 font-body text-lg text-muted-foreground">
        What active decisions look like at session start.
      </p>
      <div className="mt-10">
        <InjectionTerminal />
      </div>
    </Container>
  );
}
