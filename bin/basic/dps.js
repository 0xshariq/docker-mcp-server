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
  list: '📋',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DPS`)} ${colors.dim('- Docker Process Status (List Containers)')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   List running Docker containers with status, ports, and basic information`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dps')} ${colors.option('[options]')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-a, --all')}            Show all containers (including stopped)`);
  console.log(`   ${colors.option('-q, --quiet')}          Only show container IDs`);
  console.log(`   ${colors.option('-s, --size')}           Display total file sizes`);
  console.log(`   ${colors.option('--no-trunc')}           Don't truncate output`);
  console.log(`   ${colors.option('-f, --filter')} ${colors.white('KEY=VALUE')}  Filter output based on conditions`);
  console.log(`   ${colors.option('--format')} ${colors.white('FORMAT')}         Pretty-print using Go template`);
  
  console.log(`
${colors.bright('� EXAMPLES:')}`);
  console.log(`   ${colors.command('dps')}                         ${colors.dim('# List running containers')}`);
  console.log(`   ${colors.command('dps')} ${colors.option('-a')}                     ${colors.dim('# List all containers (running + stopped)')}`);
  console.log(`   ${colors.command('dps')} ${colors.option('-q')}                     ${colors.dim('# Show only container IDs')}`);
  console.log(`   ${colors.command('dps')} ${colors.option('--filter status=exited')} ${colors.dim('# Show only stopped containers')}`);
  console.log(`   ${colors.command('dps')} ${colors.option('--filter name=web')}      ${colors.dim('# Show containers with "web" in name')}`);
  console.log(`   ${colors.command('dps')} ${colors.option('--format "table {{.Names}}\\t{{.Status}}"')} ${colors.dim('# Custom format')}`);
  
  console.log(`
${colors.bright('🔄 CONTAINER STATES:')}`);
  console.log(`   ${colors.dim('• ')}${colors.success('Running')}  - Container is currently active`);
  console.log(`   ${colors.dim('• ')}${colors.warning('Exited')}   - Container stopped normally`);
  console.log(`   ${colors.dim('• ')}${colors.error('Dead')}     - Container failed to start or crashed`);
  console.log(`   ${colors.dim('• ')}${colors.info('Paused')}   - Container execution paused`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dpsa')}      - List all containers (shortcut for dps -a)`);
  console.log(`   ${colors.command('dlogs')}     - View container logs`);
  console.log(`   ${colors.command('dinspect')}  - Get detailed container information`);
  console.log(`   ${colors.command('dexec')}     - Execute commands in running container`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-ps')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

// Show what will be executed
console.log(`${colors.info(`${icon.list} Listing Docker containers...`)}`);

// Execute docker ps command
const dockerArgs = ['ps', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Container list retrieved successfully`)}`);
  } else {
    console.log(`\n${colors.error(`${icon.error} Docker ps command failed`)}`);
    console.log(colors.dim('Make sure Docker is running'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker ps: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is installed and running'));
  process.exit(1);
});
