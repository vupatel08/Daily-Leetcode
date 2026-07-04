import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { ExtractedDecision } from '@groundwork/shared';
import { Extractor } from './types';

/**
 * CI/CD Config Extractor
 *
 * Reads GitHub Actions workflow files to surface deployment / test
 * infrastructure decisions (Node version, required checks, etc).
 */
export class CIConfigExtractor implements Extractor {
  name = 'ci-config';
  priority = 70;

  async canExtract(projectPath: string): Promise<boolean> {
    try {
      const files = await readdir(join(projectPath, '.github', 'workflows'));
      return files.some((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
    } catch {
      return false;
    }
  }

  async extract(projectPath: string): Promise<ExtractedDecision[]> {
    const decisions: ExtractedDecision[] = [];
    let files: string[] = [];
    const workflowDir = join(projectPath, '.github', 'workflows');

    try {
      files = (await readdir(workflowDir)).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
    } catch {
      return [];
    }

    for (const file of files) {
      let content = '';
      try {
        content = await readFile(join(workflowDir, file), 'utf-8');
      } catch {
        continue;
      }

      // Node version
      const nodeMatch = content.match(/node-version:\s*['"]?([\d.x]+)['"]?/);
      if (nodeMatch) {
        decisions.push({
          title: `CI runs on Node.js ${nodeMatch[1]}`,
          domain: 'Infrastructure',
          priority: 'P1',
          confidence: 0.85,
          source: `.github/workflows/${file}`,
          affectedModules: ['*'],
          metadata: { node: nodeMatch[1] },
        });
      }

      // Deployment targets
      if (/vercel/i.test(content)) {
        decisions.push({
          title: 'Deploys to Vercel',
          domain: 'Infrastructure',
          priority: 'P1',
          confidence: 0.82,
          source: `.github/workflows/${file}`,
        });
      }
      if (/aws|amazon/i.test(content) && /deploy/i.test(content)) {
        decisions.push({
          title: 'Deploys to AWS',
          domain: 'Infrastructure',
          priority: 'P1',
          confidence: 0.78,
          source: `.github/workflows/${file}`,
        });
      }

      // Required test check
      if (/npm (run )?test|yarn test|pnpm test|jest|vitest/i.test(content)) {
        decisions.push({
          title: 'CI requires tests to pass',
          domain: 'Testing',
          priority: 'P1',
          confidence: 0.8,
          source: `.github/workflows/${file}`,
        });
      }
    }

    return decisions;
  }
}
