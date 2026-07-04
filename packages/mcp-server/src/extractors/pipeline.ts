import { ExtractedDecision } from '@groundwork/shared';
import { Extractor } from './types';
import { ClaudeMdExtractor } from './claude-md-extractor';
import { PackageJsonExtractor } from './package-json-extractor';
import { PrismaSchemaExtractor } from './prisma-schema-extractor';
import { GitHistoryExtractor } from './git-history-extractor';
import { CIConfigExtractor } from './ci-config-extractor';

export * from './types';
export { ClaudeMdExtractor } from './claude-md-extractor';
export { PackageJsonExtractor } from './package-json-extractor';
export { PrismaSchemaExtractor } from './prisma-schema-extractor';
export { GitHistoryExtractor } from './git-history-extractor';
export { CIConfigExtractor } from './ci-config-extractor';

/**
 * ExtractionPipeline
 *
 * Orchestrates all registered extractors, runs the ones that apply to a
 * project, then merges + deduplicates the resulting decisions. When two
 * extractors produce the same decision, the one from the higher-priority
 * (higher-signal) extractor wins.
 */
export class ExtractionPipeline {
  private extractors: Extractor[];

  constructor(extractors?: Extractor[]) {
    this.extractors =
      extractors ??
      [
        new ClaudeMdExtractor(),
        new PrismaSchemaExtractor(),
        new PackageJsonExtractor(),
        new CIConfigExtractor(),
        new GitHistoryExtractor(),
      ];
    // Run highest priority first for deterministic dedupe
    this.extractors.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Run every applicable extractor against the project and return a
   * deduplicated list of decisions.
   */
  async run(projectPath: string): Promise<ExtractedDecision[]> {
    const all: { decision: ExtractedDecision; extractorPriority: number }[] = [];

    for (const extractor of this.extractors) {
      try {
        if (await extractor.canExtract(projectPath)) {
          const decisions = await extractor.extract(projectPath);
          for (const decision of decisions) {
            all.push({ decision, extractorPriority: extractor.priority });
          }
        }
      } catch (err) {
        console.error(`[ExtractionPipeline] ${extractor.name} failed:`, err);
      }
    }

    return this.deduplicate(all);
  }

  /**
   * Normalize a title for comparison (case-insensitive, whitespace-collapsed).
   */
  private normalizeTitle(title: string): string {
    return title.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  /**
   * Merge decisions with the same normalized title. Higher extractor
   * priority wins; confidence is taken as the max of the merged set.
   */
  private deduplicate(
    items: { decision: ExtractedDecision; extractorPriority: number }[]
  ): ExtractedDecision[] {
    const byKey = new Map<string, { decision: ExtractedDecision; extractorPriority: number }>();

    for (const item of items) {
      const key = this.normalizeTitle(item.decision.title);
      const existing = byKey.get(key);

      if (!existing) {
        byKey.set(key, item);
        continue;
      }

      // Keep the higher-signal decision, but take max confidence and
      // union of affected modules.
      const winner = item.extractorPriority > existing.extractorPriority ? item : existing;
      const other = winner === item ? existing : item;

      winner.decision.confidence = Math.max(
        winner.decision.confidence,
        other.decision.confidence
      );
      winner.decision.affectedModules = this.unionModules(
        winner.decision.affectedModules,
        other.decision.affectedModules
      );

      byKey.set(key, winner);
    }

    return Array.from(byKey.values()).map((v) => v.decision);
  }

  private unionModules(a?: string[], b?: string[]): string[] | undefined {
    if (!a && !b) return undefined;
    const set = new Set<string>([...(a || []), ...(b || [])]);
    return Array.from(set);
  }
}
