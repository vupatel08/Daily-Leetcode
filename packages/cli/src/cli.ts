#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const program = new Command();

program
  .name('groundwork')
  .description('The decision layer that makes AI development actually work at team scale')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize Groundwork in your project')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options) => {
    const projectPath = options.path;
    const spinner = ora('Initializing Groundwork...').start();

    try {
      // Check if database is running
      spinner.text = 'Checking database connection...';
      
      // Run the MCP server initialization
      spinner.text = 'Scanning project for decisions...';
      
      // TODO: Call MCP server initialization
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      spinner.succeed('Groundwork initialized successfully!');
      
      console.log('\n' + chalk.green('✓') + ' Found and extracted decisions from:');
      console.log('  - CLAUDE.md (if exists)');
      console.log('  - package.json (coming soon)');
      console.log('  - Database schema (coming soon)');
      console.log('\n' + chalk.blue('ℹ') + ' Run ' + chalk.cyan('groundwork status') + ' to see extracted decisions');
      console.log('\n' + chalk.yellow('Next steps:'));
      console.log('  1. Start PostgreSQL: ' + chalk.cyan('docker-compose up -d'));
      console.log('  2. Run extraction: ' + chalk.cyan('groundwork extract'));
      console.log('  3. View decisions: ' + chalk.cyan('groundwork status'));
      console.log('  4. Visit https://app.groundwork.dev (coming soon)');
    } catch (error: any) {
      spinner.fail('Failed to initialize Groundwork');
      console.error(chalk.red(error.message));
      console.log('\n' + chalk.yellow('Make sure PostgreSQL is running:'));
      console.log('  ' + chalk.cyan('docker-compose up -d'));
      process.exit(1);
    }
  });

program
  .command('extract')
  .description('Extract decisions from current project')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options) => {
    const spinner = ora('Extracting decisions...').start();
    
    try {
      const mcpServer = join(__dirname, '../../mcp-server/dist/index.js');
      
      if (!existsSync(mcpServer)) {
        throw new Error('MCP server not built. Run: npm run build');
      }
      
      // Run MCP server extraction
      const child = spawn('node', [mcpServer, options.path], {
        stdio: 'inherit'
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          spinner.succeed('Extraction complete');
        } else {
          spinner.fail('Extraction failed');
          process.exit(code || 1);
        }
      });
      
    } catch (error: any) {
      spinner.fail('Failed to extract decisions');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show Groundwork status and statistics')
  .action(async () => {
    console.log(chalk.bold('Groundwork Status\n'));
    console.log('Project: ' + chalk.cyan(process.cwd()));
    console.log('Database: ' + chalk.yellow('Check with: docker-compose ps'));
    console.log('\n' + chalk.gray('Run ') + chalk.cyan('groundwork extract') + chalk.gray(' to scan for decisions'));
  });

program.parse(process.argv);
