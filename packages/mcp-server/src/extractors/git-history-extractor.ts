import { execSync } from 'child_process';
import { ExtractedDecision } from '@groundwork/shared';
import { Extractor } from './types';

/**
 * Git History Extractor
 *
 * Scans recent commit messages for technology migration / decision signals.
 * Lower confidence than declarative sources since it's heuristic.
 */
export class GitHistoryExtractor implements Extractor {
  name = 'git-history';
  priority = 50;

  private static readonly SIGNALS: { pattern: RegExp; title: (m: RegExpMatchArray) => string }[] = [
    { pattern: /switch(?:ed)? from (\w+) to (\w+)/i, title: (m) => `Migrated from ${m[1]} to ${m[2]}` },
    { pattern: /migrat(?:e|ed|ing) to (\w[\w.\-]*)/i, title: (m) => `Migration to ${m[1]}` },
    { pattern: /replace(?:d)? (\w+) with (\w+)/i, title: (m) => `Replaced ${m[1]} with ${m[2]}` },
    { pattern: /adopt(?:ed)? (\w[\w.\-]*)/i, title: (m) => `Adopted ${m[1]}` },
  ];

  async canExtract(projectPath: string): Promise<boolean> {
    try {
      execSync('git rev-parse --is-inside-work-tree', { cwd: projectPath, stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async extract(projectPath: string): Promise<ExtractedDecision[]> {
    let log = '';
    try {
      log = execSync('git log --since="90 days ago" --pretty=format:%s', {
        cwd: projectPath,
        encoding: 'utf-8',
        maxBuffer: 5 * 1024 * 1024,
      });
    } catch {
      return [];
    }

    const decisions: ExtractedDecision[] = [];
    const seen = new Set<string>();

    for (const line of log.split('\n')) {
      for (const signal of GitHistoryExtractor.SIGNALS) {
        const m = line.match(signal.pattern);
        if (m) {
          const title = signal.title(m);
          if (seen.has(title)) continue;
          seen.add(title);
          decisions.push({
            title,
            domain: 'Other',
            priority: 'P2',
            confidence: 0.65,
            source: 'git-history',
            rationale: `Inferred from commit message: "${line.trim()}"`,
          });
        }
      }
    }

    return decisions;
  }
}
