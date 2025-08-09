#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced CLI styling using chalk
const colors = {
  title: chalk.cyan.bold,
  command: chalk.cyan,
  option: chalk.yellow,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  dim: chalk.gray,
  white: chalk.white,
  bright: chalk.bold
};

const icon = {
  docker: '🐳',
  prune: '🧹',
  info: 'ℹ️',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`\n${colors.title(`${icon.docker} DPRUNE`)} ${colors.dim('- Docker System Cleanup Command')}\n`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Remove unused Docker objects to free up disk space with comprehensive cleanup options`);
  
  console.log(`\n${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dprune')} ${colors.option('[type]')} ${colors.option('[options]')}`);
  
  console.log(`\n${colors.bright('📝 OBJECT TYPES:')}`);
  console.log(`   ${colors.option('system')}     - Remove all unused objects (containers, images, networks)`);
  console.log(`   ${colors.option('images')}     - Remove unused images only`);
  console.log(`   ${colors.option('containers')} - Remove stopped containers only`);
  console.log(`   ${colors.option('volumes')}    - Remove unused volumes only (${colors.error('⚠️  DATA LOSS RISK')})`);
  console.log(`   ${colors.option('networks')}   - Remove unused networks only`);
  console.log(`   ${colors.dim('(no type)')}  - Interactive system prune (default)`);
  
  console.log(`\n${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}        Show this help message`);
  console.log(`   ${colors.option('-f, --force')}       Don't prompt for confirmation`);
  console.log(`   ${colors.option('-a, --all')}         Remove all unused images (not just dangling)`);
  console.log(`   ${colors.option('--volumes')}         Include volumes when using system prune`);
  console.log(`   ${colors.option('--filter')}          Apply filters (e.g., until=24h, label=env=test)`);
  
  console.log(`\n${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dprune')}                           ${colors.dim('# Interactive system prune')}`);
  console.log(`   ${colors.command('dprune')} ${colors.white('system')} ${colors.option('-f')}               ${colors.dim('# Force system cleanup')}`);
  console.log(`   ${colors.command('dprune')} ${colors.white('images')} ${colors.option('-a')}               ${colors.dim('# Remove all unused images')}`);
  console.log(`   ${colors.command('dprune')} ${colors.white('containers')} ${colors.option('-f')}           ${colors.dim('# Remove stopped containers')}`);
  console.log(`   ${colors.command('dprune')} ${colors.white('volumes')} ${colors.option('-f')}            ${colors.dim('# Remove unused volumes (DANGEROUS!)')}`);
  console.log(`   ${colors.command('dprune')} ${colors.white('networks')}              ${colors.dim('# Remove unused networks')}`);
  console.log(`   ${colors.command('dprune')} ${colors.white('system')} ${colors.option('--volumes -f')}     ${colors.dim('# Full cleanup including volumes')}`);
  console.log(`   ${colors.command('dprune')} ${colors.white('images')} ${colors.option('--filter until=24h')} ${colors.dim('# Remove images older than 24h')}`);
  
  console.log(`\n${colors.bright('⚠️  SAFETY WARNINGS:')}`);
  console.log(`   ${colors.error('• Volume cleanup permanently deletes data')}`);
  console.log(`   ${colors.warning('• Always backup important data before cleanup')}`);
  console.log(`   ${colors.warning('• Use --filter to avoid removing critical objects')}`);
  console.log(`   ${colors.warning('• Test without -f flag to see what will be removed')}`);
  
  console.log(`\n${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dimages')} - List Docker images`);
  console.log(`   ${colors.command('dps')}     - List running containers`);
  console.log(`   ${colors.command('dpsa')}    - List all containers`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-prune')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);
let pruneType = 'system'; // default
let dockerOptions = [];
let forceFlag = false;
let allFlag = false;
let volumesFlag = false;
let filters = [];

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '-f' || arg === '--force') {
    forceFlag = true;
  } else if (arg === '-a' || arg === '--all') {
    allFlag = true;
  } else if (arg === '--volumes') {
    volumesFlag = true;
  } else if (arg === '--filter') {
    if (i + 1 < args.length) {
      filters.push('--filter', args[i + 1]);
      i++; // skip next argument
    }
  } else if (!arg.startsWith('-') && i === 0) {
    // First non-option argument is the prune type
    if (['system', 'images', 'containers', 'volumes', 'networks'].includes(arg)) {
      pruneType = arg;
    } else {
      console.log(colors.error(`${icon.error} Invalid prune type: ${arg}`));
      console.log(colors.dim(`Valid types: system, images, containers, volumes, networks`));
      process.exit(1);
    }
  }
}

// Build docker command based on type
let dockerCommand = [];

switch (pruneType) {
  case 'system':
    dockerCommand = ['system', 'prune'];
    if (volumesFlag) dockerCommand.push('--volumes');
    break;
  case 'images':
    dockerCommand = ['image', 'prune'];
    if (allFlag) dockerCommand.push('--all');
    break;
  case 'containers':
    dockerCommand = ['container', 'prune'];
    break;
  case 'volumes':
    dockerCommand = ['volume', 'prune'];
    console.log(colors.error(`${icon.warning} WARNING: Volume cleanup will permanently delete data!`));
    break;
  case 'networks':
    dockerCommand = ['network', 'prune'];
    break;
}

// Add common options
if (forceFlag) {
  dockerCommand.push('--force');
}

// Add filters
dockerCommand.push(...filters);

// Show what will be executed
console.log(colors.info(`${icon.prune} Docker cleanup: ${pruneType}`));
if (!forceFlag && pruneType !== 'volumes') {
  console.log(colors.dim(`Running: docker ${dockerCommand.join(' ')}`));
} else if (pruneType === 'volumes' && !forceFlag) {
  console.log(colors.error(`⚠️  This will remove unused volumes and their data permanently!`));
  console.log(colors.dim(`Running: docker ${dockerCommand.join(' ')}`));
}

// Execute docker prune command
const child = spawn('docker', dockerCommand, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(colors.success(`${icon.success} Cleanup completed successfully`));
  } else {
    console.log(colors.error(`${icon.error} Cleanup failed`));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(colors.error(`${icon.error} Error executing docker command: ${error.message}`));
  process.exit(1);
});
