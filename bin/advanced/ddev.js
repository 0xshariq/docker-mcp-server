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
  dev: '⚡',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`\n${colors.title(`${icon.docker} DDEV`)} ${colors.dim('- Docker Development Environment Manager')}\n`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Streamlined development environment management with Docker`);
  
  console.log(`\n${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('ddev')} ${colors.option('<command>')} ${colors.option('[options]')}`);
  
  console.log(`\n${colors.bright('🚀 COMMANDS:')}`);
  console.log(`   ${colors.option('start')}      ${colors.dim('Start development environment')}`);
  console.log(`   ${colors.option('stop')}       ${colors.dim('Stop development environment')}`);
  console.log(`   ${colors.option('restart')}    ${colors.dim('Restart development environment')}`);
  console.log(`   ${colors.option('status')}     ${colors.dim('Show environment status')}`);
  console.log(`   ${colors.option('logs')}       ${colors.dim('View environment logs')}`);
  console.log(`   ${colors.option('shell')}      ${colors.dim('Access development shell')}`);
  console.log(`   ${colors.option('rebuild')}    ${colors.dim('Rebuild development images')}`);
  console.log(`   ${colors.option('clean')}      ${colors.dim('Clean development environment')}`);
  
  console.log(`\n${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}         Show this help message`);
  console.log(`   ${colors.option('-f, --file')} ${colors.white('FILE')}     Use specific docker-compose file`);
  console.log(`   ${colors.option('--env')} ${colors.white('ENV')}           Set environment (dev, staging, prod)`);
  console.log(`   ${colors.option('--detach')}           Run in detached mode`);
  console.log(`   ${colors.option('--build')}            Force rebuild of images`);
  
  console.log(`\n${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('ddev')} ${colors.option('start')}                        ${colors.dim('# Start development environment')}`);
  console.log(`   ${colors.command('ddev')} ${colors.option('start')} ${colors.option('--build')}               ${colors.dim('# Start with rebuild')}`);
  console.log(`   ${colors.command('ddev')} ${colors.option('logs')} ${colors.white('web')}                    ${colors.dim('# View logs for web service')}`);
  console.log(`   ${colors.command('ddev')} ${colors.option('shell')} ${colors.white('app')}                   ${colors.dim('# Access shell in app container')}`);
  console.log(`   ${colors.command('ddev')} ${colors.option('restart')} ${colors.option('--env')} ${colors.white('staging')}      ${colors.dim('# Restart with staging config')}`);
  
  console.log(`\n${colors.bright('🔧 DEVELOPMENT WORKFLOWS:')}`);
  console.log(`   ${colors.dim('• start → Development environment up and running')}`);
  console.log(`   ${colors.dim('• logs → Monitor application output and errors')}`);
  console.log(`   ${colors.dim('• shell → Debug and run commands inside containers')}`);
  console.log(`   ${colors.dim('• rebuild → Update containers after code changes')}`);
  console.log(`   ${colors.dim('• clean → Reset environment for fresh start')}`);
  
  console.log(`\n${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dcompose')}  - Docker Compose management`);
  console.log(`   ${colors.command('dup')}       - Start services (docker-compose up)')}`);
  console.log(`   ${colors.command('ddown')}     - Stop services (docker-compose down)')}`);
  console.log(`   ${colors.command('dlogs')}     - View container logs`);
  console.log(`   ${colors.command('dexec')}     - Execute commands in containers`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-compose')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(colors.error(`${icon.error} Please specify a command`));
  console.log(colors.dim(`Usage: ${colors.command('ddev')} ${colors.option('<command>')}`));
  console.log(colors.dim(`Run '${colors.command('ddev --help')}' for more information`));
  process.exit(1);
}

const command = args[0];
const options = args.slice(1);

// Development environment commands
const devCommands = {
  start: () => {
    const composeArgs = ['up', '--detach'];
    if (options.includes('--build')) composeArgs.push('--build');
    executeDockerCompose(composeArgs, 'Starting development environment...');
  },
  
  stop: () => {
    executeDockerCompose(['down'], 'Stopping development environment...');
  },
  
  restart: () => {
    executeDockerCompose(['restart'], 'Restarting development environment...');
  },
  
  status: () => {
    executeDockerCompose(['ps'], 'Checking development environment status...');
  },
  
  logs: () => {
    const service = options[0];
    const composeArgs = service ? ['logs', '-f', service] : ['logs', '-f'];
    executeDockerCompose(composeArgs, `Viewing logs${service ? ' for ' + service : ''}...`);
  },
  
  shell: () => {
    const service = options[0] || 'app';
    const composeArgs = ['exec', service, '/bin/bash'];
    executeDockerCompose(composeArgs, `Accessing shell in ${service} container...`);
  },
  
  rebuild: () => {
    executeDockerCompose(['build', '--no-cache'], 'Rebuilding development images...');
  },
  
  clean: () => {
    executeDockerCompose(['down', '--volumes', '--remove-orphans'], 'Cleaning development environment...');
  }
};

function executeDockerCompose(composeArgs, message) {
  console.log(colors.info(`${icon.dev} ${message}`));
  
  // Check for docker-compose file
  const composeFile = options.includes('-f') || options.includes('--file') 
    ? options[options.indexOf('-f') + 1] || options[options.indexOf('--file') + 1]
    : 'docker-compose.yml';
  
  const dockerComposeArgs = ['-f', composeFile, ...composeArgs];
  
  const child = spawn('docker-compose', dockerComposeArgs, {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  child.on('exit', (code) => {
    if (code === 0) {
      console.log(colors.success(`${icon.success} Development command completed successfully`));
    } else {
      console.log(colors.error(`${icon.error} Development command failed`));
    }
    process.exit(code || 0);
  });

  child.on('error', (error) => {
    console.log(colors.error(`${icon.error} Error executing docker-compose: ${error.message}`));
    process.exit(1);
  });
}

// Execute command
if (devCommands[command]) {
  devCommands[command]();
} else {
  console.log(colors.error(`${icon.error} Unknown command: ${colors.white(command)}`));
  console.log(colors.dim(`Available commands: ${Object.keys(devCommands).join(', ')}`));
  console.log(colors.dim(`Run '${colors.command('ddev --help')}' for more information`));
  process.exit(1);
}


