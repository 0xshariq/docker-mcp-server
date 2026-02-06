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
  list: '📋',
  container: '📦',
  network: '🌐',
  volume: '💾',
  image: '🖼️',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DLIST`)} ${colors.dim('- Docker Universal Object Lister')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   List various Docker objects including containers, images, networks, volumes, and more`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dlist')} ${colors.option('[object]')} ${colors.option('[options]')}`);
  
  console.log(`
${colors.bright('📝 OBJECT TYPES:')}`);
  console.log(`   ${colors.option('containers, c')}         List containers (default if no object specified)`);
  console.log(`   ${colors.option('images, img')}           List images`);
  console.log(`   ${colors.option('networks, net')}         List networks`);
  console.log(`   ${colors.option('volumes, vol')}          List volumes`);
  console.log(`   ${colors.option('nodes')}                 List swarm nodes`);
  console.log(`   ${colors.option('services, svc')}         List swarm services`);
  console.log(`   ${colors.option('secrets')}               List swarm secrets`);
  console.log(`   ${colors.option('configs')}               List swarm configs`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}            Show this help message`);
  console.log(`   ${colors.option('-a, --all')}             Show all (including stopped containers)`);
  console.log(`   ${colors.option('-q, --quiet')}           Only show IDs`);
  console.log(`   ${colors.option('-f, --filter')} ${colors.white('KEY=VALUE')}   Filter output`);
  console.log(`   ${colors.option('--format')} ${colors.white('FORMAT')}          Pretty-print using Go template`);
  console.log(`   ${colors.option('--no-trunc')}            Don't truncate output`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dlist')}                           ${colors.dim('# List running containers (default)')}`);
  console.log(`   ${colors.command('dlist')} ${colors.option('containers -a')}             ${colors.dim('# List all containers')}`);
  console.log(`   ${colors.command('dlist')} ${colors.option('images')}                   ${colors.dim('# List all images')}`);
  console.log(`   ${colors.command('dlist')} ${colors.option('networks')}                 ${colors.dim('# List all networks')}`);
  console.log(`   ${colors.command('dlist')} ${colors.option('volumes')}                  ${colors.dim('# List all volumes')}`);
  console.log(`   ${colors.command('dlist')} ${colors.option('containers -q')}            ${colors.dim('# Show only container IDs')}`);
  console.log(`   ${colors.command('dlist')} ${colors.option('images --filter dangling=true')} ${colors.dim('# Show dangling images')}`);
  
  console.log(`
${colors.bright('🔍 FILTER EXAMPLES:')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('status=running')}        - Only running containers`);
  console.log(`   ${colors.dim('• ')}${colors.option('name=web')}             - Objects with "web" in name`);
  console.log(`   ${colors.dim('• ')}${colors.option('label=env=prod')}       - Objects with specific labels`);
  console.log(`   ${colors.dim('• ')}${colors.option('dangling=true')}        - Dangling images`);
  console.log(`   ${colors.dim('• ')}${colors.option('driver=bridge')}        - Networks with bridge driver`);
  
  console.log(`
${colors.bright('🎯 QUICK SHORTCUTS:')}`);
  console.log(`   ${colors.dim('• ')}${colors.command('dps')}      - Equivalent to ${colors.option('dlist containers')}`);
  console.log(`   ${colors.dim('• ')}${colors.command('dimages')}  - Equivalent to ${colors.option('dlist images')}`);
  console.log(`   ${colors.dim('• ')}${colors.command('dnetwork')} - More advanced network management`);
  console.log(`   ${colors.dim('• ')}${colors.command('dvolume')}  - More advanced volume management`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dps')}       - List containers specifically`);
  console.log(`   ${colors.command('dimages')}   - List images specifically`);
  console.log(`   ${colors.command('dnetwork')}  - Network management`);
  console.log(`   ${colors.command('dvolume')}   - Volume management`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-list')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);
let objectType = 'containers'; // default
let dockerArgs = [];

// Determine object type
const objectTypes = {
  'containers': 'ps',
  'c': 'ps',
  'images': 'images',
  'img': 'images',
  'networks': 'network ls',
  'net': 'network ls',
  'volumes': 'volume ls',
  'vol': 'volume ls',
  'nodes': 'node ls',
  'services': 'service ls',
  'svc': 'service ls',
  'secrets': 'secret ls',
  'configs': 'config ls'
};

if (args.length > 0 && objectTypes[args[0]]) {
  objectType = args[0];
  dockerArgs = objectTypes[objectType].split(' ').concat(args.slice(1));
} else {
  // Default to containers
  dockerArgs = ['ps'].concat(args);
}

// Show what will be executed
const objectName = objectType === 'c' ? 'containers' : 
                  objectType === 'img' ? 'images' : 
                  objectType === 'net' ? 'networks' : 
                  objectType === 'vol' ? 'volumes' : 
                  objectType === 'svc' ? 'services' : objectType;

console.log(`${colors.info(`${icon.list} Listing Docker ${objectName}...`)}`);

// Execute docker command
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} ${objectName} list retrieved successfully`)}`);
  } else {
    console.log(`\n${colors.error(`${icon.error} Docker list command failed`)}`);
    console.log(colors.dim('Make sure Docker is running and object type is valid'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker command: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is installed and running'));
  process.exit(1);
});
