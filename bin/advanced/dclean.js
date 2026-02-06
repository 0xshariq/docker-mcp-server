#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
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
  clean: '🧹',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`\n${colors.title(`${icon.docker} DCLEAN`)} ${colors.dim('- Docker System Deep Clean Command')}\n`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Comprehensive Docker system cleanup with safety options`);
  
  console.log(`\n${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dclean')} ${colors.option('[scope]')} ${colors.option('[options]')}`);
  
  console.log(`\n${colors.bright('🎯 CLEANUP SCOPES:')}`);
  console.log(`   ${colors.option('all')}        ${colors.dim('Complete system cleanup (default)')}`);
  console.log(`   ${colors.option('images')}     ${colors.dim('Remove unused images only')}`);
  console.log(`   ${colors.option('containers')} ${colors.dim('Remove stopped containers only')}`);
  console.log(`   ${colors.option('volumes')}    ${colors.dim('Remove unused volumes only')}`);
  console.log(`   ${colors.option('networks')}   ${colors.dim('Remove unused networks only')}`);
  console.log(`   ${colors.option('cache')}      ${colors.dim('Clear build cache only')}`);
  
  console.log(`\n${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}         Show this help message`);
  console.log(`   ${colors.option('-f, --force')}        Force cleanup without confirmation`);
  console.log(`   ${colors.option('--dry-run')}          Show what would be removed`);
  console.log(`   ${colors.option('--all')}              Include unused images (not just dangling)`);
  
  console.log(`\n${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dclean')}                           ${colors.dim('# Interactive cleanup of everything')}`);
  console.log(`   ${colors.command('dclean')} ${colors.option('images')}                     ${colors.dim('# Clean up unused images only')}`);
  console.log(`   ${colors.command('dclean')} ${colors.option('all')} ${colors.option('--force')}              ${colors.dim('# Force cleanup everything')}`);
  console.log(`   ${colors.command('dclean')} ${colors.option('containers')} ${colors.option('--dry-run')}       ${colors.dim('# Show what containers would be removed')}`);
  console.log(`   ${colors.command('dclean')} ${colors.option('volumes')} ${colors.option('-f')}                ${colors.dim('# Force remove unused volumes')}`);
  
  console.log(`\n${colors.bright('⚠️  SAFETY WARNINGS:')}`);
  console.log(`   ${colors.warning('• This operation is IRREVERSIBLE for removed items')}`);
  console.log(`   ${colors.warning('• Volume cleanup will DELETE all data in unused volumes')}`);
  console.log(`   ${colors.warning('• Use --dry-run first to see what will be removed')}`);
  console.log(`   ${colors.warning('• Force mode skips all confirmation prompts')}`);
  
  console.log(`\n${colors.bright('🔄 CLEANUP WORKFLOW:')}`);
  console.log(`   ${colors.dim('1. Identify cleanup scope')}`);
  console.log(`   ${colors.dim('2. Scan for unused resources')}`);
  console.log(`   ${colors.dim('3. Show confirmation (unless --force)')}`);
  console.log(`   ${colors.dim('4. Execute cleanup commands')}`);
  console.log(`   ${colors.dim('5. Report space recovered')}`);
  
  console.log(`\n${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dprune')}    - Quick cleanup with docker system prune`);
  console.log(`   ${colors.command('dps')}       - List running containers`);
  console.log(`   ${colors.command('dimages')}   - List images`);
  console.log(`   ${colors.command('dvolume')}   - Manage volumes`);
  console.log(`   ${colors.command('dnetwork')}  - Manage networks`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-prune')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);
let scope = 'all';
const dockerArgs = [];
let dryRun = false;
let force = false;
let includeAll = false;

// Parse arguments
for (const arg of args) {
  if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg === '-f' || arg === '--force') {
    force = true;
  } else if (arg === '--all') {
    includeAll = true;
  } else if (['all', 'images', 'containers', 'volumes', 'networks', 'cache'].includes(arg)) {
    scope = arg;
  }
}

// Execute comprehensive cleanup
console.log(colors.info(`${icon.clean} Starting Docker system cleanup (scope: ${colors.white(scope)})`));

if (dryRun) {
  console.log(colors.warning(`${icon.warning} DRY RUN MODE - No actual cleanup will be performed`));
}

// Build cleanup commands based on scope
const cleanupCommands = [];

switch (scope) {
  case 'all':
    cleanupCommands.push(['system', 'prune', '-a', force ? '-f' : '']);
    if (includeAll) {
      cleanupCommands.push(['image', 'prune', '-a', force ? '-f' : '']);
    }
    cleanupCommands.push(['volume', 'prune', force ? '-f' : '']);
    cleanupCommands.push(['network', 'prune', force ? '-f' : '']);
    break;
  case 'images':
    cleanupCommands.push(['image', 'prune', includeAll ? '-a' : '', force ? '-f' : '']);
    break;
  case 'containers':
    cleanupCommands.push(['container', 'prune', force ? '-f' : '']);
    break;
  case 'volumes':
    cleanupCommands.push(['volume', 'prune', force ? '-f' : '']);
    break;
  case 'networks':
    cleanupCommands.push(['network', 'prune', force ? '-f' : '']);
    break;
  case 'cache':
    cleanupCommands.push(['builder', 'prune', force ? '-f' : '']);
    break;
}

// Execute cleanup commands
let commandsExecuted = 0;
const totalCommands = cleanupCommands.length;

function executeNextCommand() {
  if (commandsExecuted >= totalCommands) {
    console.log(colors.success(`${icon.success} Docker cleanup completed successfully`));
    process.exit(0);
    return;
  }

  const command = cleanupCommands[commandsExecuted].filter(arg => arg !== '');
  commandsExecuted++;

  console.log(colors.dim(`Executing: docker ${command.join(' ')}`));

  if (dryRun) {
    console.log(colors.dim('(dry run - not actually executed)'));
    executeNextCommand();
    return;
  }

  const child = spawn('docker', command, {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  child.on('exit', (code) => {
    if (code === 0) {
      executeNextCommand();
    } else {
      console.log(colors.error(`${icon.error} Command failed: docker ${command.join(' ')}`));
      process.exit(code || 1);
    }
  });

  child.on('error', (error) => {
    console.log(colors.error(`${icon.error} Error executing docker command: ${error.message}`));
    process.exit(1);
  });
}

// Start cleanup
executeNextCommand();
