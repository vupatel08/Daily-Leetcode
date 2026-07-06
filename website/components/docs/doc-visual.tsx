import type { ComponentType } from "react";
import { ArchitectureStackVisual } from "./visuals/architecture-stack";
import { CliDecisionsPreview } from "./visuals/cli-decisions-preview";
import { CodebaseDashboardPreview } from "./visuals/codebase-dashboard-preview";
import { ConflictResolutionBoard } from "./visuals/conflict-resolution-board";
import { DecisionGraphBoard } from "./visuals/decision-graph-board";
import { DecisionGraphNetwork } from "./visuals/decision-graph-network";
import { FeaturePillarsBoard } from "./visuals/feature-pillars-board";
import { InjectionPreview } from "./visuals/injection-preview";
import { SessionFlowVisual } from "./visuals/session-flow";
import { TaxonomyMatrix } from "./visuals/taxonomy-matrix";
import { DecisionTimeline } from "@/components/demos/decision-timeline";

export const DOC_VISUALS: Record<string, ComponentType> = {
  "architecture-stack": ArchitectureStackVisual,
  "feature-pillars": FeaturePillarsBoard,
  "decision-graph-board": DecisionGraphBoard,
  "decision-graph-network": DecisionGraphNetwork,
  "decision-timeline": DecisionTimeline,
  "injection-preview": InjectionPreview,
  "conflict-board": ConflictResolutionBoard,
  "codebase-dashboard": CodebaseDashboardPreview,
  "session-flow": SessionFlowVisual,
  "cli-decisions": CliDecisionsPreview,
  "taxonomy-matrix": TaxonomyMatrix,
};

export function DocVisual({ id }: { id: string }) {
  const Component = DOC_VISUALS[id];
  if (!Component) {
    return (
      <div className="my-8 border-2 border-dashed border-foreground/30 p-6 font-mono text-xs text-muted-foreground">
        Visual not found: {id}
      </div>
    );
  }
  return (
    <div className="my-10 not-prose">
      <Component />
    </div>
  );
}
