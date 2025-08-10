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
  run: '🚀',
  container: '📦',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`\n${colors.title(`${icon.docker} DRUN`)} ${colors.dim('- Docker Container Runner')}\n`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Run a Docker container with comprehensive options and interactive capabilities`);
  console.log(`   Supports all docker run options with enhanced user experience`);
  
  console.log(`\n${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('[options]')} ${colors.white('IMAGE')} ${colors.option('[command] [args...]')}`);
  
  console.log(`\n${colors.bright('📝 ESSENTIAL OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-d, --detach')}         Run container in background (detached mode)`);
  console.log(`   ${colors.option('-it')}                  Run interactively with TTY (combined -i and -t)`);
  console.log(`   ${colors.option('-i, --interactive')}    Keep STDIN open even if not attached`);
  console.log(`   ${colors.option('-t, --tty')}            Allocate a pseudo-TTY`);
  console.log(`   ${colors.option('--rm')}                 Automatically remove container when it exits`);
  console.log(`   ${colors.option('--name')} ${colors.white('NAME')}        Assign a name to the container`);
  
  console.log(`\n${colors.bright('🌐 NETWORKING OPTIONS:')}`);
  console.log(`   ${colors.option('-p, --publish')} ${colors.white('HOST:CONTAINER')} Publish container port to host`);
  console.log(`   ${colors.option('-P, --publish-all')}    Publish all exposed ports to random host ports`);
  console.log(`   ${colors.option('--network')} ${colors.white('NETWORK')}    Connect container to network`);
  console.log(`   ${colors.option('--hostname')} ${colors.white('NAME')}      Container host name`);
  
  console.log(`\n${colors.bright('💾 STORAGE OPTIONS:')}`);
  console.log(`   ${colors.option('-v, --volume')} ${colors.white('HOST:CONTAINER')} Bind mount a volume`);
  console.log(`   ${colors.option('--mount')} ${colors.white('TYPE=...')}      Advanced mount options`);
  console.log(`   ${colors.option('-w, --workdir')} ${colors.white('DIR')}     Working directory inside container`);
  
  console.log(`\n${colors.bright('🔧 ENVIRONMENT OPTIONS:')}`);
  console.log(`   ${colors.option('-e, --env')} ${colors.white('VAR=VALUE')}   Set environment variables`);
  console.log(`   ${colors.option('--env-file')} ${colors.white('FILE')}      Read environment variables from file`);
  console.log(`   ${colors.option('-u, --user')} ${colors.white('USER')}      Username or UID (format: <name|uid>[:<group|gid>])`);
  
  console.log(`\n${colors.bright('⚡ RESOURCE OPTIONS:')}`);
  console.log(`   ${colors.option('-m, --memory')} ${colors.white('LIMIT')}    Memory limit (e.g., 512m, 2g)`);
  console.log(`   ${colors.option('--cpus')} ${colors.white('LIMIT')}         Number of CPUs (e.g., 0.5, 2.0)`);
  console.log(`   ${colors.option('--restart')} ${colors.white('POLICY')}     Restart policy (no, always, on-failure, unless-stopped)`);
  
  console.log(`\n${colors.bright('🔒 SECURITY OPTIONS:')}`);
  console.log(`   ${colors.option('--privileged')}         Give extended privileges to container`);
  console.log(`   ${colors.option('--cap-add')} ${colors.white('CAP')}        Add Linux capabilities`);
  console.log(`   ${colors.option('--cap-drop')} ${colors.white('CAP')}       Drop Linux capabilities`);
  
  console.log(`\n${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('drun')} ${colors.white('nginx')}                                   ${colors.dim('# Run nginx in foreground')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-d --name web -p 8080:80')} ${colors.white('nginx')}      ${colors.dim('# Run nginx detached with port mapping')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-it --rm')} ${colors.white('ubuntu:20.04 bash')}        ${colors.dim('# Interactive Ubuntu shell, auto-remove')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-d --restart always --name db')} ${colors.white('postgres')} ${colors.dim('# Run PostgreSQL with auto-restart')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-e MYSQL_ROOT_PASSWORD=secret')} ${colors.white('mysql')}  ${colors.dim('# Run MySQL with environment variable')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-v /data:/var/lib/mysql')} ${colors.white('mysql')}      ${colors.dim('# Run MySQL with volume mount')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-m 512m --cpus 1.0')} ${colors.white('myapp')}         ${colors.dim('# Run with resource limits')}`);
  
  console.log(`\n${colors.bright('🔄 WORKFLOW TIPS:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.option('-it')} ${colors.dim('for interactive containers')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.option('--rm')} ${colors.dim('for temporary containers')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.option('-d')} ${colors.dim('for background services')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.option('--name')} ${colors.dim('for easier management')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dps')} ${colors.dim('to check running containers')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dlogs')} ${colors.dim('to view container logs')}`);
  
  console.log(`\n${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dps')}      - List running containers`);
  console.log(`   ${colors.command('dimages')}  - List available images`);
  console.log(`   ${colors.command('dlogs')}    - View container logs`);
  console.log(`   ${colors.command('dexec')}    - Execute commands in containers`);
  console.log(`   ${colors.command('dstop')}    - Stop running containers`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-run')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`${colors.error(`${icon.error} Error: Image name required`)}`);
  console.log(colors.dim(`Usage: ${colors.command('drun')} ${colors.option('[options]')} ${colors.white('IMAGE')} ${colors.option('[command]')}`));
  console.log(colors.dim(`Run '${colors.command('drun --help')}' for more information`));
  process.exit(1);
}

// Show what will be executed
const imageName = args.find(arg => !arg.startsWith('-')) || 'unknown';
console.log(`${colors.info(`${icon.run} Running Docker container from image: ${colors.white(imageName)}`)}`);

// Check if running interactively
const isInteractive = args.includes('-it') || (args.includes('-i') && args.includes('-t'));
if (isInteractive) {
  console.log(colors.dim('Running in interactive mode...'));
}

// Execute docker run command
const child = spawn('docker', ['run', ...args], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Container completed successfully`)}`);
  } else {
    console.log(`\n${colors.warning(`${icon.warning} Container exited with code ${code}`)}`);
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker run: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is running and image exists'));
  process.exit(1);
});
