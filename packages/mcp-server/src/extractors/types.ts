import { ExtractedDecision } from '@groundwork/shared';

/**
 * Common interface implemented by every extractor.
 */
export interface Extractor {
  /** Unique extractor name */
  name: string;
  /** Higher runs first; used to prefer higher-signal sources on dedupe */
  priority: number;
  /** Whether this extractor has something to extract for the given project */
  canExtract(projectPath: string): Promise<boolean>;
  /** Extract decisions from the project */
  extract(projectPath: string): Promise<ExtractedDecision[]>;
}
