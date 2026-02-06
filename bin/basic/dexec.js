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
  exec: '⚡',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DEXEC`)} ${colors.dim('- Docker Execute Commands in Container')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Execute commands inside a running Docker container interactively or non-interactively`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dexec')} ${colors.option('[options]')} ${colors.white('CONTAINER')} ${colors.white('COMMAND')} ${colors.option('[args...]')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-i, --interactive')}    Keep STDIN open even if not attached`);
  console.log(`   ${colors.option('-t, --tty')}            Allocate a pseudo-TTY`);
  console.log(`   ${colors.option('-d, --detach')}         Detached mode (run in background)`);
  console.log(`   ${colors.option('-u, --user')} ${colors.white('USER')}      Username or UID (format: <name|uid>[:<group|gid>])`);
  console.log(`   ${colors.option('-w, --workdir')} ${colors.white('DIR')}    Working directory inside container`);
  console.log(`   ${colors.option('-e, --env')} ${colors.white('KEY=VAL')}    Set environment variables`);
  console.log(`   ${colors.option('--privileged')}         Give extended privileges to command`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dexec')} ${colors.white('myapp')} ${colors.white('bash')}                    ${colors.dim('# Open bash shell in container')}`);
  console.log(`   ${colors.command('dexec')} ${colors.option('-it')} ${colors.white('myapp')} ${colors.white('bash')}              ${colors.dim('# Interactive bash with TTY')}`);
  console.log(`   ${colors.command('dexec')} ${colors.white('myapp')} ${colors.white('ls -la /app')}             ${colors.dim('# List files in /app directory')}`);
  console.log(`   ${colors.command('dexec')} ${colors.option('-u root')} ${colors.white('myapp')} ${colors.white('apt update')}    ${colors.dim('# Run as root user')}`);
  console.log(`   ${colors.command('dexec')} ${colors.option('-e NODE_ENV=dev')} ${colors.white('myapp')} ${colors.white('npm test')} ${colors.dim('# Set environment variable')}`);
  console.log(`   ${colors.command('dexec')} ${colors.option('-w /tmp')} ${colors.white('myapp')} ${colors.white('pwd')}          ${colors.dim('# Execute from /tmp directory')}`);
  
  console.log(`
${colors.bright('🔄 COMMON COMMANDS:')}`);
  console.log(`   ${colors.dim('• ')}${colors.command('bash, sh')}         - Shell access`);
  console.log(`   ${colors.dim('• ')}${colors.command('ps aux')}           - List processes`);
  console.log(`   ${colors.dim('• ')}${colors.command('top, htop')}        - System monitoring`);
  console.log(`   ${colors.dim('• ')}${colors.command('tail -f /var/log/*')} - View logs`);
  console.log(`   ${colors.dim('• ')}${colors.command('env')}              - List environment variables`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('drun')}      - Create and run a new container`);
  console.log(`   ${colors.command('dps')}       - List running containers`);
  console.log(`   ${colors.command('dlogs')}     - View container logs`);
  console.log(`   ${colors.command('dinspect')}  - Get detailed container information`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-exec')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`${colors.error(`${icon.error} Error: Container name and command required`)}`);
  console.log(colors.dim(`Usage: ${colors.command('dexec')} ${colors.white('CONTAINER')} ${colors.white('COMMAND')}`));
  console.log(colors.dim(`Run '${colors.command('dexec --help')}' for more information`));
  process.exit(1);
}

// Show what will be executed
const containerName = args.find(arg => !arg.startsWith('-'));
console.log(`${colors.info(`${icon.exec} Executing command in container: ${colors.white(containerName)}`)}`);

// Execute docker exec command
const dockerArgs = ['exec', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Command executed successfully`)}`);
  } else if (code === 125) {
    console.log(`\n${colors.error(`${icon.error} Docker exec error - check container name and command`)}`);
    console.log(colors.dim(`Use '${colors.command('dps')}' to see running containers`));
  } else {
    console.log(`\n${colors.warning(`${icon.warning} Command exited with code ${code}`)}`);
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker exec: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is running and container exists'));
  process.exit(1);
});
