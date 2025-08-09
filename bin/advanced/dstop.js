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
  stop: '⏹️',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`\n${colors.title(`${icon.docker} DSTOP`)} ${colors.dim('- Docker Container Stop Command')}\n`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Stop one or more running Docker containers gracefully`);
  
  console.log(`\n${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dstop')} ${colors.option('[options]')} ${colors.option('<container...>')}`);
  
  console.log(`\n${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}         Show this help message`);
  console.log(`   ${colors.option('-t, --time')} ${colors.white('SECONDS')}   Seconds to wait before killing (default: 10)`);
  
  console.log(`\n${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dstop')} ${colors.white('web-app')}                    ${colors.dim('# Stop single container')}`);
  console.log(`   ${colors.command('dstop')} ${colors.white('web-app database')}          ${colors.dim('# Stop multiple containers')}`);
  console.log(`   ${colors.command('dstop')} ${colors.option('-t 30')} ${colors.white('web-app')}            ${colors.dim('# Stop with 30s timeout')}`);
  console.log(`   ${colors.command('dstop')} ${colors.option('--time 0')} ${colors.white('redis')}            ${colors.dim('# Force stop immediately')}`);
  console.log(`   ${colors.command('dstop')} ${colors.white('$(docker ps -q)')}          ${colors.dim('# Stop all running containers')}`);
  
  console.log(`\n${colors.bright('🔄 WORKFLOW:')}`);
  console.log(`   ${colors.dim('1. Send SIGTERM signal to container processes')}`);
  console.log(`   ${colors.dim('2. Wait for specified timeout period')}`);
  console.log(`   ${colors.dim('3. Send SIGKILL if still running after timeout')}`);
  console.log(`   ${colors.dim('4. Container status changes to "Exited"')}`);
  
  console.log(`\n${colors.bright('📊 CONTAINER STATES:')}`);
  console.log(`   ${colors.dim('• Running → Stopped (Normal stop)')}`);
  console.log(`   ${colors.dim('• Paused  → Stopped (Also works on paused containers)')}`);
  console.log(`   ${colors.dim('• Stopped → No change (Already stopped)')}`);
  
  console.log(`\n${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dstart')}    - Start stopped containers`);
  console.log(`   ${colors.command('drestart')}  - Restart containers`);
  console.log(`   ${colors.command('dps')}       - List running containers`);
  console.log(`   ${colors.command('dpsa')}      - List all containers`);
  console.log(`   ${colors.command('drm')}       - Remove stopped containers`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-containers')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);
const containers = [];
let timeout = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-t' || arg === '--time') {
    if (i + 1 < args.length && !isNaN(args[i + 1])) {
      timeout = args[i + 1];
      i++; // skip next argument
    } else {
      console.log(colors.error(`${icon.error} Invalid timeout value`));
      process.exit(1);
    }
  } else if (!arg.startsWith('-')) {
    containers.push(arg);
  }
}

// Validate input
if (containers.length === 0) {
  console.log(colors.error(`${icon.error} Please specify at least one container name or ID`));
  console.log(colors.dim(`Usage: ${colors.command('dstop')} ${colors.option('[options]')} ${colors.option('<container>')}`));
  console.log(colors.dim(`Run '${colors.command('dstop --help')}' for more information`));
  process.exit(1);
}

// Build docker command
const dockerArgs = ['stop'];
if (timeout !== null) {
  dockerArgs.push('-t', timeout);
}
dockerArgs.push(...containers);

// Execute docker stop command
console.log(colors.info(`${icon.stop} Stopping container(s): ${colors.white(containers.join(', '))}`));
if (timeout !== null) {
  if (timeout === '0') {
    console.log(colors.warning(`${icon.warning} Force stopping immediately (no graceful shutdown)`));
  } else {
    console.log(colors.dim(`Using timeout: ${timeout} seconds`));
  }
}

const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(colors.success(`${icon.success} Successfully stopped container(s): ${colors.white(containers.join(', '))}`));
  } else {
    console.log(colors.error(`${icon.error} Failed to stop container(s)`));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(colors.error(`${icon.error} Error executing docker command: ${error.message}`));
  process.exit(1);
});