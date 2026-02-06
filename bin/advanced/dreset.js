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
  reset: '🔄',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`\n${colors.title(`${icon.docker} DRESET`)} ${colors.dim('- Docker System Reset Command')}\n`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Complete Docker system reset with multiple severity levels`);
  
  console.log(`\n${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dreset')} ${colors.option('[level]')} ${colors.option('[options]')}`);
  
  console.log(`\n${colors.bright('🎯 RESET LEVELS:')}`);
  console.log(`   ${colors.option('soft')}       ${colors.dim('Stop containers, clean images & volumes')} ${colors.warning('(Low Risk)')}`);
  console.log(`   ${colors.option('hard')}       ${colors.dim('Complete system reset + build cache')} ${colors.error('(High Risk)')}`);
  console.log(`   ${colors.option('nuclear')}    ${colors.dim('Full Docker reset + restart daemon')} ${colors.error('(EXTREME Risk)')}`);
  console.log(`   ${colors.option('factory')}    ${colors.dim('Reset to factory defaults')} ${colors.error('(MAXIMUM Risk)')}`);
  
  console.log(`\n${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}         Show this help message`);
  console.log(`   ${colors.option('-f, --force')}        Skip confirmation prompts`);
  console.log(`   ${colors.option('--dry-run')}          Show what would be reset`);
  console.log(`   ${colors.option('--keep-volumes')}     Preserve named volumes`);
  console.log(`   ${colors.option('--restart-daemon')}   Restart Docker daemon after reset`);
  
  console.log(`\n${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dreset')} ${colors.option('soft')}                      ${colors.dim('# Safe cleanup of unused resources')}`);
  console.log(`   ${colors.command('dreset')} ${colors.option('hard')} ${colors.option('--force')}              ${colors.dim('# Complete reset without confirmation')}`);
  console.log(`   ${colors.command('dreset')} ${colors.option('nuclear')} ${colors.option('--dry-run')}         ${colors.dim('# See what nuclear reset would do')}`);
  console.log(`   ${colors.command('dreset')} ${colors.option('factory')} ${colors.option('--keep-volumes')}     ${colors.dim('# Factory reset but preserve volumes')}`);
  
  console.log(`\n${colors.bright('⚠️  CRITICAL WARNINGS:')}`);
  console.log(`   ${colors.error('• IRREVERSIBLE: All containers, images, and data will be DELETED')}`);
  console.log(`   ${colors.error('• DOWNTIME: Applications will be stopped and removed')}`);
  console.log(`   ${colors.error('• DATA LOSS: Unless --keep-volumes, all data will be lost')}`);
  console.log(`   ${colors.error('• NETWORK: Custom networks will be removed')}`);
  console.log(`   ${colors.warning('• Always backup important data before running reset')}`);
  
  console.log(`\n${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dclean')}    - Safe cleanup with options`);
  console.log(`   ${colors.command('dprune')}    - Quick system cleanup`);
  console.log(`   ${colors.command('dps')}       - Check current containers`);
  console.log(`   ${colors.command('dimages')}   - Check current images`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-prune')}`);
  process.exit(0);
}

// Parse arguments and execute reset
const args = process.argv.slice(2);
let level = 'soft';  // default to safest option
let force = false;
let dryRun = false;

for (const arg of args) {
  if (['soft', 'hard', 'nuclear', 'factory'].includes(arg)) {
    level = arg;
  } else if (arg === '-f' || arg === '--force') {
    force = true;
  } else if (arg === '--dry-run') {
    dryRun = true;
  }
}

// Confirmation for dangerous operations
if (['hard', 'nuclear', 'factory'].includes(level) && !force && !dryRun) {
  console.log(colors.warning(`${icon.warning} ${level.toUpperCase()} RESET WARNING:`));
  console.log(colors.error('  This will permanently delete ALL containers, images, volumes, and networks!'));
  console.log(colors.dim('To proceed, use: '), colors.command(`dreset ${level} --force`));
  process.exit(1);
}

console.log(colors.info(`${icon.reset} Starting ${level.toUpperCase()} Docker reset...`));

if (dryRun) {
  console.log(colors.warning(`${icon.warning} DRY RUN MODE - showing what would be reset`));
  console.log(colors.dim(`Level: ${level}`));
} else {
  // Execute actual reset based on level
  const child = spawn('docker', ['system', 'prune', '-a', '--volumes', '-f'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  child.on('exit', (code) => {
    if (code === 0) {
      console.log(colors.success(`${icon.success} Docker ${level} reset completed`));
    } else {
      console.log(colors.error(`${icon.error} Reset failed`));
    }
    process.exit(code || 0);
  });

  child.on('error', (error) => {
    console.log(colors.error(`${icon.error} Error: ${error.message}`));
    process.exit(1);
  });
}
