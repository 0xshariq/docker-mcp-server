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
  network: '🌐',
  bridge: '🌉',
  overlay: '🔗',
  host: '🏠',
  none: '🚫',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DNETWORK`)} ${colors.dim('- Docker Network Management Suite')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Comprehensive Docker network management including creation, inspection, and connectivity`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('[command]')} ${colors.option('[options]')}`);
  
  console.log(`
${colors.bright('🎯 COMMANDS:')}`);
  console.log(`   ${colors.option('create')} ${colors.white('NAME')}         Create a network`);
  console.log(`   ${colors.option('ls, list')}              List networks`);
  console.log(`   ${colors.option('rm, remove')} ${colors.white('NAME')}      Remove one or more networks`);
  console.log(`   ${colors.option('inspect')} ${colors.white('NAME')}        Display detailed network information`);
  console.log(`   ${colors.option('connect')} ${colors.white('NET CONTAINER')} Connect container to network`);
  console.log(`   ${colors.option('disconnect')} ${colors.white('NET CONTAINER')} Disconnect container from network`);
  console.log(`   ${colors.option('prune')}                Remove all unused networks`);
  
  console.log(`
${colors.bright('📝 NETWORK DRIVERS:')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('bridge')}     - Default isolated network`);
  console.log(`   ${colors.dim('• ')}${colors.option('host')}       - Use host networking (no isolation)`);
  console.log(`   ${colors.dim('• ')}${colors.option('overlay')}    - Multi-host networking (Swarm)`);
  console.log(`   ${colors.dim('• ')}${colors.option('macvlan')}    - Assign MAC addresses to containers`);
  console.log(`   ${colors.dim('• ')}${colors.option('none')}       - Disable all networking`);
  console.log(`   ${colors.dim('• ')}${colors.option('custom')}     - Third-party network plugins`);
  
  console.log(`
${colors.bright('📝 CREATE OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-d, --driver')} ${colors.white('DRIVER')}   Network driver (default: bridge)`);
  console.log(`   ${colors.option('--subnet')} ${colors.white('CIDR')}        Subnet in CIDR format`);
  console.log(`   ${colors.option('--gateway')} ${colors.white('IP')}         Gateway for the master subnet`);
  console.log(`   ${colors.option('--ip-range')} ${colors.white('CIDR')}      Allocate IPs from a range`);
  console.log(`   ${colors.option('--label')} ${colors.white('KEY=VALUE')}     Set metadata on network`);
  console.log(`   ${colors.option('--attachable')}         Enable manual container attachment`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('ls')}                        ${colors.dim('# List all networks')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('create mynet')}              ${colors.dim('# Create bridge network')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('create -d overlay swarm-net')} ${colors.dim('# Create overlay network')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('create --subnet 172.20.0.0/16 mynet')} ${colors.dim('# Create with custom subnet')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('inspect mynet')}             ${colors.dim('# Show network details')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('connect mynet web-container')} ${colors.dim('# Connect container to network')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('disconnect mynet web-container')} ${colors.dim('# Disconnect container')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('rm mynet')}                  ${colors.dim('# Remove network')}`);
  console.log(`   ${colors.command('dnetwork')} ${colors.option('prune')}                     ${colors.dim('# Remove unused networks')}`);
  
  console.log(`
${colors.bright('🌐 NETWORK ARCHITECTURE:')}`);
  console.log(`   ${colors.dim('• ')}${colors.bright('Bridge Networks:')} Isolated container communication`);
  console.log(`   ${colors.dim('• ')}${colors.bright('Host Networks:')} Direct host network access`);
  console.log(`   ${colors.dim('• ')}${colors.bright('Overlay Networks:')} Multi-host container communication`);
  console.log(`   ${colors.dim('• ')}${colors.bright('Custom Networks:')} Advanced networking with DNS`);
  
  console.log(`
${colors.bright('🔧 NETWORKING BEST PRACTICES:')}`);
  console.log(`   ${colors.dim('• Create custom networks instead of using default bridge')}`);
  console.log(`   ${colors.dim('• Use meaningful network names for organization')}`);
  console.log(`   ${colors.dim('• Plan IP ranges to avoid conflicts with host networks')}`);
  console.log(`   ${colors.dim('• Use labels to tag networks with metadata')}`);
  console.log(`   ${colors.dim('• Regular cleanup with')} ${colors.command('dnetwork prune')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dbridge')}   - Bridge network specific operations`);
  console.log(`   ${colors.command('drun')}      - Run containers with network options`);
  console.log(`   ${colors.command('dinspect')}  - Inspect network configuration`);
  console.log(`   ${colors.command('dlist')}     - List various Docker objects`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-network')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`${colors.info(`${icon.network} Listing Docker networks (default action)...`)}`);
  args.push('ls');
} else {
  console.log(`${colors.info(`${icon.network} Managing Docker network: ${colors.white(args.join(' '))}`)}`);
}

// Execute docker network command
const dockerArgs = ['network', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Network operation completed successfully`)}`);
  } else {
    console.log(`\n${colors.error(`${icon.error} Network operation failed`)}`);
    console.log(colors.dim('Check network name and ensure Docker is running'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker network: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is installed and running'));
  process.exit(1);
});
