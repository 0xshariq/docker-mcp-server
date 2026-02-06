#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
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

// Icons for better UX
const icon = {
  docker: '🐳',
  compose: '🐙',
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️'
};

// Function to display comprehensive help
function showHelp() {
  console.log(`\n${chalk.cyan(icon.compose)} ${chalk.bold('DCOMPOSE')} ${chalk.gray('- Docker Compose Multi-Container Management')}\n`);
  
  console.log(`${chalk.bold('📋 DESCRIPTION:')}`);
  console.log(`   Manage multi-container Docker applications using Docker Compose`);
  console.log(`   Simplifies orchestration of complex containerized applications\n`);
  
  console.log(`${chalk.bold('🔧 USAGE:')}`);
  console.log(`   ${chalk.green('dcompose')} ${chalk.yellow('[command]')} ${chalk.yellow('[options]')}\n`);
  
  console.log(`${chalk.bold('💡 EXAMPLES:')}`);
  console.log(`   ${chalk.cyan('dcompose up')}                        ${chalk.gray('# Start all services')}`);
  console.log(`   ${chalk.cyan('dcompose up -d')}                     ${chalk.gray('# Start in detached mode')}`);
  console.log(`   ${chalk.cyan('dcompose down')}                      ${chalk.gray('# Stop and remove containers')}`);
  console.log(`   ${chalk.cyan('dcompose logs web')}                  ${chalk.gray('# View logs for web service')}`);
  console.log(`   ${chalk.cyan('dcompose build --no-cache')}          ${chalk.gray('# Rebuild services without cache')}`);
  console.log(`   ${chalk.cyan('dcompose ps')}                        ${chalk.gray('# List running containers')}`);
  console.log(`   ${chalk.cyan('dcompose exec web bash')}             ${chalk.gray('# Execute bash in web container')}\n`);
  
  console.log(`${chalk.bold('📝 COMMON COMMANDS:')}`);
  console.log(`   ${chalk.yellow('up'.padEnd(12))}                    Create and start containers`);
  console.log(`   ${chalk.yellow('down'.padEnd(12))}                  Stop and remove containers`);
  console.log(`   ${chalk.yellow('build'.padEnd(12))}                 Build or rebuild services`);
  console.log(`   ${chalk.yellow('start'.padEnd(12))}                 Start existing containers`);
  console.log(`   ${chalk.yellow('stop'.padEnd(12))}                  Stop running containers`);
  console.log(`   ${chalk.yellow('restart'.padEnd(12))}               Restart containers`);
  console.log(`   ${chalk.yellow('logs'.padEnd(12))}                  View output from containers`);
  console.log(`   ${chalk.yellow('ps'.padEnd(12))}                    List containers`);
  console.log(`   ${chalk.yellow('exec'.padEnd(12))}                  Execute command in container`);
  console.log(`   ${chalk.yellow('pull'.padEnd(12))}                  Pull service images`);
  console.log(`   ${chalk.yellow('push'.padEnd(12))}                  Push service images`);
  console.log(`   ${chalk.yellow('config'.padEnd(12))}                Validate and view compose file\n`);
  
  console.log(`${chalk.bold('🚀 COMPOSE FEATURES:')}`);
  console.log(`   ${chalk.gray('• Multi-container application orchestration')}`);
  console.log(`   ${chalk.gray('• Service dependency management')}`);
  console.log(`   ${chalk.gray('• Network and volume configuration')}`);
  console.log(`   ${chalk.gray('• Environment variable management')}`);
  console.log(`   ${chalk.gray('• Health check integration')}`);
  console.log(`   ${chalk.gray('• Scaling and load balancing')}\n`);
  
  console.log(`${chalk.bold('📝 COMMON OPTIONS:')}`);
  console.log(`   ${chalk.yellow('-d, --detach'.padEnd(30))}          Run containers in background`);
  console.log(`   ${chalk.yellow('-f, --file <file>'.padEnd(30))}     Specify compose file`);
  console.log(`   ${chalk.yellow('--build'.padEnd(30))}               Build images before starting`);
  console.log(`   ${chalk.yellow('--no-cache'.padEnd(30))}            Build without using cache`);
  console.log(`   ${chalk.yellow('--force-recreate'.padEnd(30))}      Recreate containers`);
  console.log(`   ${chalk.yellow('--remove-orphans'.padEnd(30))}      Remove containers for services not defined\n`);
  
  console.log(`${chalk.bold('📚 NOTES:')}`);
  console.log(`   ${chalk.gray('• Requires docker-compose.yml file in current directory')}`);
  console.log(`   ${chalk.gray('• Automatically detects docker-compose or docker compose command')}`);
  console.log(`   ${chalk.gray('• Use docker-compose.override.yml for local development overrides')}`);
  console.log(`   ${chalk.gray('• Environment variables can be defined in .env file')}\n`);
  
  console.log(`${chalk.gray('💼 MCP Tool: docker-compose')}`);
  process.exit(0);
}

// Check if help is requested
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
}

// Parse arguments - if no subcommand provided, default to 'up'
if (args.length === 0) {
  console.log(`${chalk.yellow(icon.warning)} No command specified, defaulting to 'up'`);
  args.push('up');
}

// Check if docker-compose command exists, fallback to docker compose
let composeCommand = 'docker-compose';
try {
  execSync('docker-compose --version', { stdio: 'ignore' });
} catch (error) {
  composeCommand = 'docker compose';
}

// Show what will be executed
console.log(`${chalk.cyan(icon.compose)} Docker Compose: ${args[0]}`);
console.log(`${chalk.gray(`Running: ${composeCommand} ${args.join(' ')}`)}`);

// Execute docker-compose command
const child = spawn(composeCommand.split(' ')[0], [...composeCommand.split(' ').slice(1), ...args], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`${chalk.green(icon.success)} Docker Compose command completed successfully`);
  } else {
    console.log(`${chalk.red(icon.error)} Docker Compose command failed`);
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${chalk.red(icon.error)} Error executing Docker Compose: ${error.message}`);
  console.log(`${chalk.gray('Make sure Docker Compose is installed and available')}`);
  process.exit(1);
});
