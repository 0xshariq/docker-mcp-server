#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

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
  logs: '📋',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DLOGS`)} ${colors.dim('- Docker Container Logs Viewer')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   View and follow logs from Docker containers with advanced filtering options`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dlogs')} ${colors.option('[options]')} ${colors.white('CONTAINER')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-f, --follow')}         Follow log output (stream)`);
  console.log(`   ${colors.option('-t, --timestamps')}     Show timestamps`);
  console.log(`   ${colors.option('--tail')} ${colors.white('N')}            Show last N lines (default: all)`);
  console.log(`   ${colors.option('--since')} ${colors.white('TIME')}        Show logs since timestamp`);
  console.log(`   ${colors.option('--until')} ${colors.white('TIME')}        Show logs until timestamp`);
  console.log(`   ${colors.option('--details')}            Show extra log details`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dlogs')} ${colors.white('myapp')}                    ${colors.dim('# Show all logs from myapp container')}`);
  console.log(`   ${colors.command('dlogs')} ${colors.option('-f')} ${colors.white('myapp')}                ${colors.dim('# Follow logs in real-time')}`);
  console.log(`   ${colors.command('dlogs')} ${colors.option('--tail 100')} ${colors.white('myapp')}        ${colors.dim('# Show last 100 lines')}`);
  console.log(`   ${colors.command('dlogs')} ${colors.option('-t -f')} ${colors.white('myapp')}             ${colors.dim('# Follow logs with timestamps')}`);
  console.log(`   ${colors.command('dlogs')} ${colors.option('--since 1h')} ${colors.white('myapp')}        ${colors.dim('# Logs from last hour')}`);
  console.log(`   ${colors.command('dlogs')} ${colors.option('--since 2023-01-01')} ${colors.white('myapp')} ${colors.dim('# Logs since specific date')}`);
  
  console.log(`
${colors.bright('🔄 WORKFLOW TIPS:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dlogs -f')} ${colors.dim('to monitor real-time logs')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('--tail 50')} ${colors.dim('to avoid overwhelming output')}`);
  console.log(`   ${colors.dim('• Press Ctrl+C to stop following logs')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dps')} ${colors.dim('to find container names first')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dps')}       - List running containers`);
  console.log(`   ${colors.command('dinspect')}  - Get detailed container information`);
  console.log(`   ${colors.command('dexec')}     - Execute commands in container`);
  console.log(`   ${colors.command('dstats')}    - View container resource usage`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-logs')}`);
  process.exit(0);
}

// Parse arguments for container name
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`${colors.error(`${icon.error} Error: Container name required`)}`);
  console.log(colors.dim(`Run '${colors.command('dlogs --help')}' for usage information`));
  process.exit(1);
}

// Show what will be executed
const containerName = args[args.length - 1]; // Last argument should be container name
const dockerArgs = ['logs', ...args];

console.log(`${colors.info(`${icon.logs} Viewing logs for container: ${colors.white(containerName)}`)}`);
if (args.includes('-f') || args.includes('--follow')) {
  console.log(colors.dim('Press Ctrl+C to stop following logs'));
}

// Execute docker logs command
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Logs command completed`)}`);
  } else if (code === 1) {
    console.log(`\n${colors.error(`${icon.error} Container not found or access denied`)}`);
    console.log(colors.dim(`Use '${colors.command('dps -a')}' to see all containers`));
  } else {
    console.log(`\n${colors.error(`${icon.error} Docker logs command failed`)}`);
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker logs: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is running and the container exists'));
  process.exit(1);
});
