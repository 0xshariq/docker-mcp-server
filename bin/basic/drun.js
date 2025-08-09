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
  console.log(`
${colors.title(`${icon.docker} DRUN`)} ${colors.dim('- Docker Container Runner')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Run a Docker container with comprehensive options and interactive capabilities`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('[options]')} ${colors.white('IMAGE')} ${colors.option('[command] [args...]')}`);
  
  console.log(`
${colors.bright('📝 COMMON OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-d, --detach')}         Run container in background (detached mode)`);
  console.log(`   ${colors.option('-it')}                  Run interactively with TTY (combined -i and -t)`);
  console.log(`   ${colors.option('-i, --interactive')}    Keep STDIN open even if not attached`);
  console.log(`   ${colors.option('-t, --tty')}            Allocate a pseudo-TTY`);
  console.log(`   ${colors.option('--rm')}                 Automatically remove container when it exits`);
  console.log(`   ${colors.option('--name')} ${colors.white('NAME')}        Assign a name to the container`);
  console.log(`   ${colors.option('-p, --publish')} ${colors.white('HOST:CONTAINER')} Publish container port to host`);
  console.log(`   ${colors.option('-P, --publish-all')}    Publish all exposed ports to random host ports`);
  console.log(`   ${colors.option('-v, --volume')} ${colors.white('HOST:CONTAINER')} Bind mount a volume`);
  console.log(`   ${colors.option('-e, --env')} ${colors.white('VAR=VALUE')}   Set environment variables`);
  console.log(`   ${colors.option('--env-file')} ${colors.white('FILE')}      Read environment variables from file`);
  console.log(`   ${colors.option('-w, --workdir')} ${colors.white('DIR')}     Working directory inside container`);
  console.log(`   ${colors.option('--restart')} ${colors.white('POLICY')}     Restart policy (no, always, on-failure, unless-stopped)`);
  console.log(`   ${colors.option('-m, --memory')} ${colors.white('LIMIT')}    Memory limit (e.g., 512m, 2g)`);
  console.log(`   ${colors.option('--cpus')} ${colors.white('LIMIT')}         Number of CPUs (e.g., 0.5, 2.0)`);
  console.log(`   ${colors.option('-u, --user')} ${colors.white('USER')}      Username or UID (format: <name|uid>[:<group|gid>])`);
  console.log(`   ${colors.option('--privileged')}         Give extended privileges to container`);
  console.log(`   ${colors.option('--network')} ${colors.white('NETWORK')}    Connect container to network`);
  console.log(`   ${colors.option('--hostname')} ${colors.white('NAME')}      Container host name`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('drun')} ${colors.white('nginx')} ${colors.option('-d --name web-server -p 8080:80')} ${colors.dim('# Run nginx in detached mode with port mapping')}`);
  console.log(`   ${colors.command('drun')} ${colors.white('ubuntu:20.04')} ${colors.option('--rm -it bash')} ${colors.dim('# Run Ubuntu interactively and remove after exit')}`);
  console.log(`   ${colors.command('drun')} ${colors.white('redis')} ${colors.option('--name redis-cache --restart always')} ${colors.dim('# Run Redis with auto-restart policy')}`);
  console.log(`   ${colors.command('drun')} ${colors.white('mysql:8.0')} ${colors.option('-e MYSQL_ROOT_PASSWORD=secret -v /data:/var/lib/mysql')} ${colors.dim('# Run MySQL with environment variable and volume mount')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--help')} ${colors.dim('# Show this help message')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-d, --detach')} ${colors.dim('– Run container in background (detached mode)')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-it')} ${colors.dim('– Run interactively with TTY (combined -i and -t)')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-i, --interactive')} ${colors.dim('– Keep STDIN open even if not attached')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-t, --tty')} ${colors.dim('– Allocate a pseudo-TTY')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--rm')} ${colors.dim('– Automatically remove container when it exits')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--name <name>')} ${colors.dim('– Assign a name to the container')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-p, --publish <host>:<container>')} ${colors.dim('– Publish container port to host (can be used multiple times)')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-P, --publish-all')} ${colors.dim('– Publish all exposed ports to random host ports')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-v, --volume <host>:<container>')} ${colors.dim('– Bind mount a volume (can be used multiple times)')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-e, --env <VAR>=<value>')} ${colors.dim('– Set environment variables (can be used multiple times)')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--env-file <file>')} ${colors.dim('– Read environment variables from file')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-w, --workdir <dir>')} ${colors.dim('– Working directory inside the container')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--restart <policy>')} ${colors.dim('– Restart policy (no, always, on-failure, unless-stopped)')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-m, --memory <limit>')} ${colors.dim('– Memory limit (e.g., 512m, 2g)')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--cpus <limit>')} ${colors.dim('– Number of CPUs (e.g., 0.5, 2.0)')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-u, --user <user>')} ${colors.dim('– Username or UID (format: <name|uid>[:<group|gid>])')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--privileged')} ${colors.dim('– Give extended privileges to this container')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--network <network>')} ${colors.dim('– Connect a container to a network')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--hostname <name>')} ${colors.dim('– Container host name')}`);
  
  console.log(`
${colors.bright('🔄 WORKFLOW TIPS:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('drun')} ${colors.dim('for quick container starts')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('--build')} ${colors.dim('after code changes')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('ddown')} ${colors.dim('to stop services')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dps')} ${colors.dim('to check running containers')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('ddown')}    - Stop containers (docker-compose down)`);
  console.log(`   ${colors.command('dcompose')} - Full Docker Compose command interface`);
  console.log(`   ${colors.command('dps')}      - List running containers`);
  console.log(`   ${colors.command('dlogs')}    - View container logs`);
  
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
