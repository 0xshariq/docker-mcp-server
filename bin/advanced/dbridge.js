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
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DBRIDGE`)} ${colors.dim('- Docker Bridge Network Manager')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Manage Docker bridge networks with advanced configuration and monitoring capabilities`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dbridge')} ${colors.option('[action]')} ${colors.option('[options]')}`);
  
  console.log(`
${colors.bright('🎯 ACTIONS:')}`);
  console.log(`   ${colors.option('create')} ${colors.white('NAME')}       Create a new bridge network`);
  console.log(`   ${colors.option('remove, rm')} ${colors.white('NAME')}    Remove a bridge network`);
  console.log(`   ${colors.option('list, ls')}            List all bridge networks`);
  console.log(`   ${colors.option('inspect')} ${colors.white('NAME')}      Show detailed network information`);
  console.log(`   ${colors.option('connect')} ${colors.white('NET CONTAINER')} Connect container to network`);
  console.log(`   ${colors.option('disconnect')} ${colors.white('NET CONTAINER')} Disconnect container from network`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('--driver')} ${colors.white('DRIVER')}     Network driver (default: bridge)`);
  console.log(`   ${colors.option('--subnet')} ${colors.white('CIDR')}      Subnet in CIDR format`);
  console.log(`   ${colors.option('--gateway')} ${colors.white('IP')}       Gateway for the master subnet`);
  console.log(`   ${colors.option('--ip-range')} ${colors.white('CIDR')}    Allocate IPs from a range`);
  console.log(`   ${colors.option('--label')} ${colors.white('KEY=VALUE')}   Set metadata on network`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dbridge')} ${colors.option('list')}                     ${colors.dim('# List all bridge networks')}`);
  console.log(`   ${colors.command('dbridge')} ${colors.option('create mynet')}             ${colors.dim('# Create bridge network')}`);
  console.log(`   ${colors.command('dbridge')} ${colors.option('create --subnet 172.20.0.0/16 mynet')} ${colors.dim('# Create with subnet')}`);
  console.log(`   ${colors.command('dbridge')} ${colors.option('inspect mynet')}            ${colors.dim('# Show network details')}`);
  console.log(`   ${colors.command('dbridge')} ${colors.option('connect mynet web-container')} ${colors.dim('# Connect container')}`);
  console.log(`   ${colors.command('dbridge')} ${colors.option('remove mynet')}             ${colors.dim('# Remove network')}`);
  
  console.log(`
${colors.bright('🌉 BRIDGE NETWORK FEATURES:')}`);
  console.log(`   ${colors.dim('• Containers can communicate with each other')}`);
  console.log(`   ${colors.dim('• Built-in DNS resolution between containers')}`);
  console.log(`   ${colors.dim('• Isolation from host network by default')}`);
  console.log(`   ${colors.dim('• Port publishing to host when needed')}`);
  console.log(`   ${colors.dim('• Custom IP ranges and gateways')}`);
  
  console.log(`
${colors.bright('🔧 BEST PRACTICES:')}`);
  console.log(`   ${colors.dim('• Use custom networks instead of default bridge')}`);
  console.log(`   ${colors.dim('• Name containers for easy DNS resolution')}`);
  console.log(`   ${colors.dim('• Plan IP ranges to avoid conflicts')}`);
  console.log(`   ${colors.dim('• Use labels for network organization')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dnetwork')}  - Advanced network management`);
  console.log(`   ${colors.command('drun')}      - Run container with network options`);
  console.log(`   ${colors.command('dinspect')}  - Inspect containers and networks`);
  console.log(`   ${colors.command('dlist')}     - List various Docker objects`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-network')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`${colors.info(`${icon.bridge} Listing bridge networks (default action)...`)}`);
  args.push('ls');
} else {
  console.log(`${colors.info(`${icon.bridge} Managing bridge network: ${colors.white(args.join(' '))}`)}`);
}

// Map bridge actions to docker network commands
const actionMap = {
  'create': 'create --driver bridge',
  'remove': 'rm',
  'rm': 'rm',
  'list': 'ls',
  'ls': 'ls',
  'inspect': 'inspect',
  'connect': 'connect',
  'disconnect': 'disconnect'
};

let dockerArgs = ['network'];
const action = args[0];

if (actionMap[action]) {
  dockerArgs = dockerArgs.concat(actionMap[action].split(' ')).concat(args.slice(1));
} else {
  // Default to network ls if no recognized action
  dockerArgs = dockerArgs.concat(['ls']).concat(args);
}

// Execute docker network command
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Bridge network operation completed`)}`);
  } else {
    console.log(`\n${colors.error(`${icon.error} Bridge network operation failed`)}`);
    console.log(colors.dim('Check network name and ensure Docker is running'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker network: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is installed and running'));
  process.exit(1);
});
