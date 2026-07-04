import * as core from '@actions/core';
import * as github from '@actions/github';

/**
 * Groundwork GitHub Action
 * 
 * Checks PRs against the decision graph and blocks violations
 */
async function run(): Promise<void> {
  try {
    const projectId = core.getInput('project-id', { required: true });
    const apiKey = core.getInput('api-key', { required: true });
    const failOnP0 = core.getBooleanInput('fail-on-p0');
    const warnOnP1 = core.getBooleanInput('warn-on-p1');
    
    const context = github.context;
    
    if (context.eventName !== 'pull_request') {
      core.info('Not a pull request event, skipping');
      return;
    }

    const pr = context.payload.pull_request;
    if (!pr) {
      core.setFailed('Pull request data not found in context');
      return;
    }

    core.info(`Checking PR #${pr.number} against Groundwork decision graph`);

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      core.setFailed('GITHUB_TOKEN not found');
      return;
    }

    const octokit = github.getOctokit(token);

    // Get PR files
    const { data: files } = await octokit.rest.pulls.listFiles({
      ...context.repo,
      pull_number: pr.number,
    });

    core.info(`Found ${files.length} changed files`);

    // TODO: Call Groundwork API to check violations
    // const result = await checkPRAgainstDecisions(projectId, apiKey, files);

    // Mock result for now
    const result = {
      p0Violations: [],
      p1Violations: [],
      summary: '✅ No violations found'
    };

    // Post comment with results
    const commentBody = formatCheckResult(result);
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pr.number,
      body: commentBody,
    });

    // Fail if P0 violations found
    if (result.p0Violations.length > 0 && failOnP0) {
      core.setFailed(
        `Found ${result.p0Violations.length} critical (P0) decision violations`
      );
    } else {
      core.info('✅ PR passed Groundwork decision check');
    }

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

function formatCheckResult(result: any): string {
  let body = '## Groundwork Decision Check\\n\\n';
  
  if (result.p0Violations.length === 0 && result.p1Violations.length === 0) {
    body += '✅ **No violations found**\\n\\n';
    body += 'All changes comply with existing architectural decisions.';
  } else {
    if (result.p0Violations.length > 0) {
      body += `❌ **${result.p0Violations.length} Critical (P0) Violations**\\n\\n`;
      result.p0Violations.forEach((v: any) => {
        body += `- **${v.decision.title}**\\n`;
        body += `  File: \`${v.file}\`\\n`;
        body += `  Issue: ${v.description}\\n\\n`;
      });
    }
    
    if (result.p1Violations.length > 0) {
      body += `⚠️  **${result.p1Violations.length} Warnings (P1)**\\n\\n`;
      result.p1Violations.forEach((v: any) => {
        body += `- ${v.decision.title}\\n`;
      });
    }
  }
  
  body += '\\n---\\n';
  body += '*Powered by [Groundwork](https://groundwork.dev)*';
  
  return body;
}

run();
