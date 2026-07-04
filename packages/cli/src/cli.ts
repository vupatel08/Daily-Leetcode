#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { Groundwork } from '@groundwork/mcp-server';

const program = new Command();

program
  .name('groundwork')
  .description('The decision layer that makes AI development actually work at team scale')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize Groundwork in your project and run the first scan')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options) => {
    const projectPath = options.path;
    const spinner = ora('Initializing Groundwork...').start();

    try {
      const gw = new Groundwork({ projectPath, store: 'local' });
      await gw.init();

      spinner.text = 'Scanning project for decisions...';
      const decisions = await gw.scanProject();
      const stats = await gw.getStats();
      await gw.close();

      // Write a starter config
      const configDir = join(projectPath, '.groundwork');
      if (!existsSync(join(configDir, 'config.json'))) {
        await mkdir(configDir, { recursive: true });
        await writeFile(
          join(configDir, 'config.json'),
          JSON.stringify({ version: 1, store: 'local', enforcement: { failOnP0: true, warnOnP1: true } }, null, 2)
        );
      }

      spinner.succeed(`Groundwork initialized — extracted ${decisions.length} decisions`);

      console.log('\n' + chalk.bold('Decision summary:'));
      console.log('  Total:  ' + chalk.green(stats.total));
      console.log('  P0:     ' + chalk.red(stats.byPriority.P0 || 0));
      console.log('  P1:     ' + chalk.yellow(stats.byPriority.P1 || 0));
      console.log('  P2:     ' + chalk.gray(stats.byPriority.P2 || 0));
      console.log('\n' + chalk.yellow('Next steps:'));
      console.log('  1. Connect your AI tools:  ' + chalk.cyan('groundwork connect'));
      console.log('  2. View decisions:         ' + chalk.cyan('groundwork status'));
    } catch (error: any) {
      spinner.fail('Failed to initialize Groundwork');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('scan')
  .description('Re-scan the project and update the decision graph')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options) => {
    const spinner = ora('Scanning project...').start();
    try {
      const gw = new Groundwork({ projectPath: options.path, store: 'local' });
      await gw.init();
      const decisions = await gw.scanProject();
      await gw.close();
      spinner.succeed(`Scan complete — ${decisions.length} decisions in graph`);
    } catch (error: any) {
      spinner.fail('Scan failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show the decision graph')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options) => {
    try {
      const gw = new Groundwork({ projectPath: options.path, store: 'local' });
      await gw.init();
      const decisions = await gw.store.getAllDecisions();
      const conflicts = await gw.store.getConflicts();
      await gw.close();

      console.log(chalk.bold('\nGroundwork Decision Graph\n'));
      if (decisions.length === 0) {
        console.log(chalk.gray('No decisions yet. Run ') + chalk.cyan('groundwork scan'));
        return;
      }

      for (const d of decisions) {
        const tag =
          d.priority === 'P0' ? chalk.red('P0') : d.priority === 'P1' ? chalk.yellow('P1') : chalk.gray('P2');
        const status = d.status === 'ACTIVE' ? chalk.green(d.status) : chalk.magenta(d.status);
        console.log(`  [${tag}] ${d.title}  ${chalk.gray('(' + d.domain + ', ' + status + ')')}`);
      }

      if (conflicts.length > 0) {
        console.log(chalk.bold.red(`\n${conflicts.length} unresolved conflict(s):`));
        conflicts.forEach((c: any) => console.log('  ⚠️  ' + c.description));
      }
    } catch (error: any) {
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('connect')
  .description('Print MCP configuration for your AI coding tools')
  .action(async () => {
    const mcpBin = 'groundwork-mcp';
    console.log(chalk.bold('\nConnect Groundwork to your AI tools via MCP\n'));
    console.log('Add this to your MCP configuration (Claude Code / Cursor):\n');
    console.log(
      chalk.cyan(
        JSON.stringify(
          { mcpServers: { groundwork: { command: mcpBin } } },
          null,
          2
        )
      )
    );
    console.log('\n' + chalk.gray('Claude Code: ~/.config/claude/mcp.json'));
    console.log(chalk.gray('Cursor:      .cursor/mcp.json in your project'));
  });

program.parse(process.argv);
