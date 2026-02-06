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
  volume: '💾',
  storage: '📁',
  mount: '🔗',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DVOLUME`)} ${colors.dim('- Docker Volume Management Suite')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Comprehensive Docker volume management for persistent data storage and sharing`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dvolume')} ${colors.option('[command]')} ${colors.option('[options]')}`);
  
  console.log(`
${colors.bright('🎯 COMMANDS:')}`);
  console.log(`   ${colors.option('create')} ${colors.white('NAME')}         Create a volume`);
  console.log(`   ${colors.option('ls, list')}              List volumes`);
  console.log(`   ${colors.option('rm, remove')} ${colors.white('NAME')}      Remove one or more volumes`);
  console.log(`   ${colors.option('inspect')} ${colors.white('NAME')}        Display detailed volume information`);
  console.log(`   ${colors.option('prune')}                Remove all unused local volumes`);
  
  console.log(`
${colors.bright('📝 CREATE OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-d, --driver')} ${colors.white('DRIVER')}   Volume driver (default: local)`);
  console.log(`   ${colors.option('-o, --opt')} ${colors.white('KEY=VALUE')}   Set driver specific options`);
  console.log(`   ${colors.option('--label')} ${colors.white('KEY=VALUE')}     Set metadata on volume`);
  
  console.log(`
${colors.bright('💾 VOLUME DRIVERS:')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('local')}       - Default local filesystem storage`);
  console.log(`   ${colors.dim('• ')}${colors.option('nfs')}         - Network File System`);
  console.log(`   ${colors.dim('• ')}${colors.option('cifs')}        - Common Internet File System`);
  console.log(`   ${colors.dim('• ')}${colors.option('tmpfs')}       - Temporary filesystem in memory`);
  console.log(`   ${colors.dim('• ')}${colors.option('custom')}      - Third-party volume plugins`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dvolume')} ${colors.option('ls')}                        ${colors.dim('# List all volumes')}`);
  console.log(`   ${colors.command('dvolume')} ${colors.option('create mydata')}             ${colors.dim('# Create a volume')}`);
  console.log(`   ${colors.command('dvolume')} ${colors.option('create --label env=prod dbdata')} ${colors.dim('# Create with label')}`);
  console.log(`   ${colors.command('dvolume')} ${colors.option('inspect mydata')}            ${colors.dim('# Show volume details')}`);
  console.log(`   ${colors.command('dvolume')} ${colors.option('rm mydata')}                 ${colors.dim('# Remove volume')}`);
  console.log(`   ${colors.command('dvolume')} ${colors.option('prune')}                     ${colors.dim('# Remove unused volumes')}`);
  
  console.log(`
${colors.bright('🔗 VOLUME USAGE WITH CONTAINERS:')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-v mydata:/data')} ${colors.white('nginx')}       ${colors.dim('# Mount named volume')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('-v /host:/container')} ${colors.white('nginx')}   ${colors.dim('# Bind mount host directory')}`);
  console.log(`   ${colors.command('drun')} ${colors.option('--mount source=mydata,target=/data')} ${colors.white('nginx')} ${colors.dim('# Mount with explicit syntax')}`);
  
  console.log(`
${colors.bright('💡 DATA PERSISTENCE PATTERNS:')}`);
  console.log(`   ${colors.dim('• ')}${colors.bright('Named Volumes:')} Managed by Docker, portable`);
  console.log(`   ${colors.dim('• ')}${colors.bright('Bind Mounts:')} Direct host filesystem access`);
  console.log(`   ${colors.dim('• ')}${colors.bright('tmpfs Mounts:')} In-memory temporary storage`);
  console.log(`   ${colors.dim('• ')}${colors.bright('Volume Containers:')} Shared storage between containers`);
  
  console.log(`
${colors.bright('🔧 BEST PRACTICES:')}`);
  console.log(`   ${colors.dim('• Use named volumes for database data persistence')}`);
  console.log(`   ${colors.dim('• Use bind mounts for development file sharing')}`);
  console.log(`   ${colors.dim('• Regular cleanup with')} ${colors.command('dvolume prune')}`);
  console.log(`   ${colors.dim('• Use labels to organize and categorize volumes')}`);
  console.log(`   ${colors.dim('• Backup important volume data regularly')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('drun')}      - Run containers with volume mounts`);
  console.log(`   ${colors.command('dinspect')}  - Inspect volume configuration`);
  console.log(`   ${colors.command('dlist')}     - List various Docker objects`);
  console.log(`   ${colors.command('dps')}       - See which containers use volumes`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-volume')}`);
  process.exit(0);
}
    

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`${colors.info(`${icon.volume} Listing Docker volumes (default action)...`)}`);
  args.push('ls');
} else {
  console.log(`${colors.info(`${icon.volume} Managing Docker volume: ${colors.white(args.join(' '))}`)}`);
}

// Execute docker volume command
const dockerArgs = ['volume', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Volume operation completed successfully`)}`);
  } else {
    console.log(`\n${colors.error(`${icon.error} Volume operation failed`)}`);
    console.log(colors.dim('Check volume name and ensure Docker is running'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker volume: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is installed and running'));
  process.exit(1);
});
