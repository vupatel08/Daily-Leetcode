import { DecisionTimeline } from "@/components/demos/decision-timeline";
import { Container } from "@/components/ui/container";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Decision timeline demo" };

export default function TimelineDemoPage() {
  return (
    <Container className="py-20 md:py-28">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Demo</p>
      <h1 className="font-display mt-4 text-4xl font-semibold">Decision timeline</h1>
      <p className="mt-4 font-body text-lg text-muted-foreground">
        How decisions move through active, disputed, and superseded states.
      </p>
      <div className="mt-10 max-w-2xl">
        <DecisionTimeline />
      </div>
    </Container>
  );
}
