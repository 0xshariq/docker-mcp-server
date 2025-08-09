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
  down: '🛑',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`\n${colors.title(`${icon.docker} DDOWN`)} ${colors.dim('- Docker Compose Down (Quick Stop)')}\n`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Quick alias for 'docker-compose down' - Stop and remove containers, networks`);
  
  console.log(`\n${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('ddown')} ${colors.option('[options]')}`);
  
  console.log(`\n${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-v, --volumes')}        Remove named volumes declared in 'volumes'`);
  console.log(`   ${colors.option('--rmi')} ${colors.white('TYPE')}           Remove images (all|local)`);
  console.log(`   ${colors.option('--remove-orphans')}     Remove containers for services not in Compose file`);
  console.log(`   ${colors.option('-f, --file')} ${colors.white('FILE')}      Specify compose file (default: docker-compose.yml)`);
  console.log(`   ${colors.option('-t, --timeout')} ${colors.white('TIMEOUT')} Timeout in seconds (default: 10)`);
  
  console.log(`\n${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('ddown')}                              ${colors.dim('# Stop and remove containers')}`);
  console.log(`   ${colors.command('ddown')} ${colors.option('-v')}                           ${colors.dim('# Also remove volumes')}`);
  console.log(`   ${colors.command('ddown')} ${colors.option('--rmi all')}                    ${colors.dim('# Also remove all images')}`);
  console.log(`   ${colors.command('ddown')} ${colors.option('--remove-orphans')}             ${colors.dim('# Remove orphaned containers')}`);
  console.log(`   ${colors.command('ddown')} ${colors.option('-f docker-compose.prod.yml')}  ${colors.dim('# Use production compose file')}`);
  console.log(`   ${colors.command('ddown')} ${colors.option('-v --rmi local')}               ${colors.dim('# Remove volumes and local images')}`);
  
  console.log(`\n${colors.bright('⚠️  SAFETY WARNINGS:')}`);
  console.log(`   ${colors.error('• -v flag removes volumes and their data permanently')}`);
  console.log(`   ${colors.error('• --rmi removes images, may affect other containers')}`);
  console.log(`   ${colors.warning('• Always backup important data before using -v')}`);
  
  console.log(`\n${colors.bright('🔄 WORKFLOW TIPS:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('ddown')} ${colors.dim('for clean shutdown')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('ddown -v')} ${colors.dim('for full cleanup (careful!)')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dup')} ${colors.dim('to start services again')}`);
  
  console.log(`\n${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dup')}      - Start containers (docker-compose up)`);
  console.log(`   ${colors.command('dcompose')} - Full Docker Compose command interface`);
  console.log(`   ${colors.command('dps')}      - List running containers`);
  console.log(`   ${colors.command('dprune')}   - Clean up unused Docker objects`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-compose')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

// Check if docker-compose command exists, fallback to docker compose
let composeCommand = 'docker-compose';
try {
  const { execSync } = await import('child_process');
  execSync('docker-compose --version', { stdio: 'ignore' });
} catch (error) {
  composeCommand = 'docker compose';
}

// Show what will be executed
const finalCommand = [composeCommand.split(' ')[0], ...composeCommand.split(' ').slice(1), 'down', ...args];
console.log(colors.info(`${icon.down} Docker Compose Down - Stopping services...`));
console.log(colors.dim(`Running: ${finalCommand.join(' ')}`));

// Show warning for destructive operations
if (args.includes('-v') || args.includes('--volumes')) {
  console.log(colors.error(`${icon.warning} WARNING: This will remove volumes and their data!`));
}
if (args.includes('--rmi')) {
  console.log(colors.warning(`${icon.warning} Note: This will also remove images`));
}

// Execute docker-compose down command
const child = spawn(finalCommand[0], finalCommand.slice(1), {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(colors.success(`${icon.success} Services stopped and cleaned up successfully`));
  } else {
    console.log(colors.error(`${icon.error} Failed to stop services`));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(colors.error(`${icon.error} Error executing Docker Compose: ${error.message}`));
  console.log(colors.dim('Make sure Docker Compose is installed and available'));
  process.exit(1);
});
