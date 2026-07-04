import * as core from '@actions/core';
import * as github from '@actions/github';
import { Groundwork, PRChecker, FileChange } from '@groundwork/mcp-server';

/**
 * Groundwork GitHub Action
 *
 * On a pull request:
 *   1. Loads the decision graph (local .groundwork store, checked into repo,
 *      or a fresh scan of the checked-out code).
 *   2. Fetches the PR's changed files and their added lines.
 *   3. Runs PRChecker to find decision violations.
 *   4. Posts a summary comment and fails the check on P0 violations.
 */
async function run(): Promise<void> {
  try {
    const failOnP0 = core.getBooleanInput('fail-on-p0');
    const token = core.getInput('github-token') || process.env.GITHUB_TOKEN || '';
    const projectPath = core.getInput('project-path') || process.cwd();

    const context = github.context;
    if (context.eventName !== 'pull_request') {
      core.info('Not a pull_request event — skipping.');
      return;
    }
    const pr = context.payload.pull_request;
    if (!pr) {
      core.setFailed('No pull_request payload found.');
      return;
    }
    if (!token) {
      core.setFailed('github-token is required.');
      return;
    }

    const octokit = github.getOctokit(token);

    // Load decisions: prefer an existing .groundwork store; else scan repo.
    const engine = new Groundwork({ projectPath, store: 'local' });
    await engine.init();
    let decisions = await engine.store.getActiveDecisions();
    if (decisions.length === 0) {
      core.info('No stored decisions found — scanning the repository...');
      await engine.scanProject();
      decisions = await engine.store.getActiveDecisions();
    }
    core.info(`Loaded ${decisions.length} active decisions.`);

    // Fetch changed files with patches
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pr.number,
      per_page: 100,
    });

    const changes: FileChange[] = files
      .filter((f) => f.patch && f.status !== 'removed')
      .map((f) => ({
        path: f.filename,
        // Only analyze added lines from the unified diff
        content: (f.patch || '')
          .split('\n')
          .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
          .map((l) => l.slice(1))
          .join('\n'),
      }));

    core.info(`Analyzing ${changes.length} changed file(s).`);

    const checker = new PRChecker();
    const result = checker.check(decisions, changes);
    const report = checker.formatReport(result);

    // Post or update a PR comment
    await upsertComment(octokit, context, pr.number, report);

    core.setOutput('violations', String(result.violations.length));
    core.setOutput('p0', String(result.p0.length));

    await engine.close();

    if (result.p0.length > 0 && failOnP0) {
      core.setFailed(`Groundwork: ${result.p0.length} critical (P0) decision violation(s).`);
    } else {
      core.info('✅ Groundwork check passed.');
    }
  } catch (err: any) {
    core.setFailed(err.message);
  }
}

const MARKER = '<!-- groundwork-decision-check -->';

async function upsertComment(
  octokit: ReturnType<typeof github.getOctokit>,
  context: typeof github.context,
  prNumber: number,
  body: string
): Promise<void> {
  const fullBody = `${MARKER}\n${body}`;
  const { data: comments } = await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    per_page: 100,
  });
  const existing = comments.find((c) => c.body && c.body.includes(MARKER));
  if (existing) {
    await octokit.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existing.id,
      body: fullBody,
    });
  } else {
    await octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
      body: fullBody,
    });
  }
}

run();
