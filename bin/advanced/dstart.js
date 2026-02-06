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
  start: '▶️',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`\n${colors.title(`${icon.docker} DSTART`)} ${colors.dim('- Docker Container Start Command')}\n`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Start one or more stopped Docker containers`);
  
  console.log(`\n${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dstart')} ${colors.option('[options]')} ${colors.option('<container...>')}`);
  
  console.log(`\n${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}         Show this help message`);
  console.log(`   ${colors.option('-a, --attach')}       Attach to the container's output`);
  console.log(`   ${colors.option('-i, --interactive')}  Keep STDIN open even if not attached`);
  
  console.log(`\n${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dstart')} ${colors.white('web-app')}                    ${colors.dim('# Start single container')}`);
  console.log(`   ${colors.command('dstart')} ${colors.white('web-app database')}          ${colors.dim('# Start multiple containers')}`);
  console.log(`   ${colors.command('dstart')} ${colors.option('-a')} ${colors.white('web-app')}              ${colors.dim('# Start and attach to container')}`);
  console.log(`   ${colors.command('dstart')} ${colors.option('-ai')} ${colors.white('interactive-app')}     ${colors.dim('# Start with interactive mode')}`);
  
  console.log(`\n${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dstop')}     - Stop running containers`);
  console.log(`   ${colors.command('drestart')}  - Restart containers`);
  console.log(`   ${colors.command('dps')}       - List running containers`);
  console.log(`   ${colors.command('dpsa')}      - List all containers`);
  console.log(`   ${colors.command('dlogs')}     - View container logs`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-containers')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);
const containers = [];
const dockerArgs = ['start'];

for (const arg of args) {
  if (arg === '-a' || arg === '--attach') {
    dockerArgs.push('-a');
  } else if (arg === '-i' || arg === '--interactive') {
    dockerArgs.push('-i');
  } else if (arg.startsWith('-') && arg.length > 2) {
    // Handle combined flags like -ai
    for (let i = 1; i < arg.length; i++) {
      const flag = arg[i];
      if (flag === 'a') dockerArgs.push('-a');
      else if (flag === 'i') dockerArgs.push('-i');
    }
  } else if (!arg.startsWith('-')) {
    containers.push(arg);
  }
}

// Validate input
if (containers.length === 0) {
  console.log(colors.error(`${icon.error} Please specify at least one container name or ID`));
  console.log(colors.dim(`Usage: ${colors.command('dstart')} ${colors.option('[options]')} ${colors.option('<container>')}`));
  console.log(colors.dim(`Run '${colors.command('dstart --help')}' for more information`));
  process.exit(1);
}

// Add containers to docker args
dockerArgs.push(...containers);

// Execute docker start command
const hasAttach = dockerArgs.includes('-a');
console.log(colors.info(`${icon.start} Starting container(s): ${colors.white(containers.join(', '))}`));

if (hasAttach) {
  console.log(colors.dim('Attaching to container output...'));
}

const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(colors.success(`${icon.success} Successfully started container(s): ${colors.white(containers.join(', '))}`));
  } else {
    console.log(colors.error(`${icon.error} Failed to start container(s)`));
    console.log(colors.dim(`Tip: Check if containers exist with ${colors.command('dpsa')}`));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(colors.error(`${icon.error} Error executing docker command: ${error.message}`));
  process.exit(1);
});
