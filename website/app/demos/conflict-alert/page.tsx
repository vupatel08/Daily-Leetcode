import { ConflictAlert } from "@/components/demos/conflict-alert";
import { Container } from "@/components/ui/container";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conflict alert demo" };

export default function ConflictDemoPage() {
  return (
    <Container className="py-20 md:py-28">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Demo</p>
      <h1 className="font-display mt-4 text-4xl font-semibold">Conflict alert</h1>
      <p className="mt-4 font-body text-lg text-muted-foreground">
        What developers see when decisions contradict.
      </p>
      <div className="mt-10 max-w-2xl">
        <ConflictAlert />
      </div>
    </Container>
  );
}
