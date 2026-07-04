import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export interface EnforcementConfig {
  failOnP0: boolean;
  warnOnP1: boolean;
}

export interface GroundworkConfig {
  version: number;
  store: 'local' | 'postgres' | 'auto';
  enforcement: EnforcementConfig;
  slackWebhook?: string;
  maxInjectedDecisions?: number;
  /** Confidence at/above which a decision goes straight to ACTIVE */
  activeThreshold?: number;
}

export const DEFAULT_CONFIG: GroundworkConfig = {
  version: 1,
  store: 'auto',
  enforcement: { failOnP0: true, warnOnP1: true },
  maxInjectedDecisions: 15,
  activeThreshold: 0.85,
};

/**
 * Load `.groundwork/config.json` from a project, merged over defaults.
 * Environment variables override file values where present.
 */
export async function loadConfig(projectPath: string = process.cwd()): Promise<GroundworkConfig> {
  const configPath = join(projectPath, '.groundwork', 'config.json');
  let fileConfig: Partial<GroundworkConfig> = {};

  if (existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(await readFile(configPath, 'utf-8'));
    } catch {
      // ignore malformed config, fall back to defaults
    }
  }

  const merged: GroundworkConfig = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    enforcement: { ...DEFAULT_CONFIG.enforcement, ...(fileConfig.enforcement || {}) },
  };

  // Env overrides
  if (process.env.GROUNDWORK_SLACK_WEBHOOK) merged.slackWebhook = process.env.GROUNDWORK_SLACK_WEBHOOK;
  if (process.env.DATABASE_URL) merged.store = 'postgres';

  return merged;
}
