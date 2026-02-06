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
  up: '🚀',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DUP`)} ${colors.dim('- Docker Compose Up (Quick Start)')}${colors.reset}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Quick alias for 'docker-compose up' - Start services defined in docker-compose.yml`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dup')} ${colors.option('[options]')} ${colors.option('[service...]')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-d, --detach')}         Run containers in background`);
  console.log(`   ${colors.option('--build')}              Build images before starting`);
  console.log(`   ${colors.option('--force-recreate')}     Recreate containers even if unchanged`);
  console.log(`   ${colors.option('--no-deps')}            Don't start linked services`);
  console.log(`   ${colors.option('-f, --file')} ${colors.white('FILE')}      Specify compose file (default: docker-compose.yml)`);
  console.log(`   ${colors.option('--scale')} ${colors.white('SERVICE=NUM')}    Scale SERVICE to NUM instances`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dup')}                              ${colors.dim('# Start all services in foreground')}`);
  console.log(`   ${colors.command('dup')} ${colors.option('-d')}                           ${colors.dim('# Start all services in background')}`);
  console.log(`   ${colors.command('dup')} ${colors.option('--build')}                      ${colors.dim('# Rebuild images then start')}`);
  console.log(`   ${colors.command('dup')} ${colors.white('web database')}                  ${colors.dim('# Start only web and database services')}`);
  console.log(`   ${colors.command('dup')} ${colors.option('-f docker-compose.prod.yml')}  ${colors.dim('# Use production compose file')}`);
  console.log(`   ${colors.command('dup')} ${colors.option('--scale web=3')}                ${colors.dim('# Start with 3 web service instances')}`);
  
  console.log(`
${colors.bright('🔄 WORKFLOW TIPS:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dup -d')} ${colors.dim('for background services')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dup --build')} ${colors.dim('after code changes')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('ddown')} ${colors.dim('to stop services')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dps')} ${colors.dim('to check running containers')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('ddown')}    - Stop containers (docker-compose down)`);
  console.log(`   ${colors.command('dcompose')} - Full Docker Compose command interface`);
  console.log(`   ${colors.command('dps')}      - List running containers`);
  console.log(`   ${colors.command('dlogs')}    - View container logs`);
  
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
const finalCommand = [composeCommand.split(' ')[0], ...composeCommand.split(' ').slice(1), 'up', ...args];
console.log(colors.info(`${icon.up} Docker Compose Up - Starting services...`));
console.log(colors.dim(`Running: ${finalCommand.join(' ')}`));

// Execute docker-compose up command
const child = spawn(finalCommand[0], finalCommand.slice(1), {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(colors.success(`${icon.success} Services started successfully`));
  } else {
    console.log(colors.error(`${icon.error} Failed to start services`));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(colors.error(`${icon.error} Error executing Docker Compose: ${error.message}`));
  console.log(colors.dim('Make sure Docker Compose is installed and available'));
  process.exit(1);
});
