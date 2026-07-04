import { DecisionStore } from './store';
import { LocalStore } from './local-store';
import { PostgresStore } from './postgres-store';

export type StoreKind = 'local' | 'postgres' | 'auto';

/**
 * Create a DecisionStore based on configuration.
 *
 *  - 'postgres' when DATABASE_URL is set or explicitly requested
 *  - 'local' JSON file otherwise
 *  - 'auto' picks postgres if DATABASE_URL is present, else local
 */
export function createStore(kind: StoreKind = 'auto', projectPath: string = process.cwd()): DecisionStore {
  const resolved =
    kind === 'auto' ? (process.env.DATABASE_URL ? 'postgres' : 'local') : kind;

  if (resolved === 'postgres') {
    return new PostgresStore();
  }
  return new LocalStore(projectPath);
}
