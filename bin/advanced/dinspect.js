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
  inspect: '🔍',
  container: '📦',
  image: '🖼️',
  network: '🌐',
  volume: '💾',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DINSPECT`)} ${colors.dim('- Docker Object Inspector')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Get detailed information about Docker containers, images, networks, volumes, and other objects`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dinspect')} ${colors.option('[options]')} ${colors.white('OBJECT [OBJECT...]')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-f, --format')} ${colors.white('FORMAT')}    Format output using Go template`);
  console.log(`   ${colors.option('-s, --size')}           Display total file sizes (containers only)`);
  console.log(`   ${colors.option('--type')} ${colors.white('TYPE')}        Return JSON for specified type`);
  
  console.log(`
${colors.bright('🎯 OBJECT TYPES:')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('Containers')}  - Running or stopped containers`);
  console.log(`   ${colors.dim('• ')}${colors.option('Images')}      - Docker images and layers`);
  console.log(`   ${colors.dim('• ')}${colors.option('Networks')}    - Docker networks and configuration`);
  console.log(`   ${colors.dim('• ')}${colors.option('Volumes')}     - Docker volumes and mount points`);
  console.log(`   ${colors.dim('• ')}${colors.option('Nodes')}       - Swarm nodes (if in swarm mode)`);
  console.log(`   ${colors.dim('• ')}${colors.option('Services')}    - Swarm services (if in swarm mode)`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dinspect')} ${colors.white('mycontainer')}              ${colors.dim('# Inspect container details')}`);
  console.log(`   ${colors.command('dinspect')} ${colors.white('nginx:latest')}             ${colors.dim('# Inspect image details')}`);
  console.log(`   ${colors.command('dinspect')} ${colors.option('-s')} ${colors.white('mycontainer')}          ${colors.dim('# Include size information')}`);
  console.log(`   ${colors.command('dinspect')} ${colors.option('--format "{{.State.Status}}"')} ${colors.white('container')} ${colors.dim('# Get container status')}`);
  console.log(`   ${colors.command('dinspect')} ${colors.option('--format "{{.Config.Image}}"')} ${colors.white('container')} ${colors.dim('# Get container image')}`);
  console.log(`   ${colors.command('dinspect')} ${colors.white('bridge')}                   ${colors.dim('# Inspect bridge network')}`);
  
  console.log(`
${colors.bright('🔍 USEFUL FORMATS:')}`);
  console.log(`   ${colors.dim('Container Status:')} ${colors.option('{{.State.Status}}')}`);
  console.log(`   ${colors.dim('Container IP:')}     ${colors.option('{{.NetworkSettings.IPAddress}}')}`);
  console.log(`   ${colors.dim('Image Architecture:')} ${colors.option('{{.Architecture}}')}`);
  console.log(`   ${colors.dim('Image Size:')}      ${colors.option('{{.Size}}')}`);
  console.log(`   ${colors.dim('Network Driver:')}  ${colors.option('{{.Driver}}')}`);
  console.log(`   ${colors.dim('Volume Mountpoint:')} ${colors.option('{{.Mountpoint}}')}`);
  
  console.log(`
${colors.bright('💡 INSPECTION TIPS:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('| jq')} ${colors.dim('to format JSON output nicely')}`);
  console.log(`   ${colors.dim('• Use format templates to extract specific fields')}`);
  console.log(`   ${colors.dim('• Inspect multiple objects at once for comparison')}`);
  console.log(`   ${colors.dim('• Check container logs with')} ${colors.command('dlogs')} ${colors.dim('after inspection')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dps')}       - List containers`);
  console.log(`   ${colors.command('dimages')}   - List images`);
  console.log(`   ${colors.command('dnetwork')}  - Network management`);
  console.log(`   ${colors.command('dvolume')}   - Volume management`);
  console.log(`   ${colors.command('dlogs')}     - View container logs`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-inspect')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`${colors.error(`${icon.error} Error: Object name required`)}`);
  console.log(colors.dim(`Usage: ${colors.command('dinspect')} ${colors.white('OBJECT_NAME')}`));
  console.log(colors.dim(`Run '${colors.command('dinspect --help')}' for more information`));
  process.exit(1);
}

// Show what will be executed
const objectName = args[args.length - 1];
console.log(`${colors.info(`${icon.inspect} Inspecting Docker object: ${colors.white(objectName)}`)}`);

// Execute docker inspect command
const dockerArgs = ['inspect', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Object inspection completed`)}`);
  } else if (code === 1) {
    console.log(`\n${colors.error(`${icon.error} Object not found or access denied`)}`);
    console.log(colors.dim(`Use '${colors.command('dps -a')}' to list containers or '${colors.command('dimages')}' to list images`));
  } else {
    console.log(`\n${colors.error(`${icon.error} Docker inspect command failed`)}`);
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker inspect: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is running and object exists'));
  process.exit(1);
});
