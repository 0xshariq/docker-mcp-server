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
  remove: '🗑️',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`\n${colors.title(`${icon.docker} DRM`)} ${colors.dim('- Docker Container Remove Command')}\n`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Remove one or more Docker containers (stopped containers only by default)`);
  
  console.log(`\n${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('drm')} ${colors.option('[options]')} ${colors.option('<container...>')}`);
  
  console.log(`\n${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}         Show this help message`);
  console.log(`   ${colors.option('-f, --force')}        Force the removal of running containers`);
  console.log(`   ${colors.option('-v, --volumes')}      Remove associated volumes`);
  console.log(`   ${colors.option('-l, --link')}         Remove the specified link`);
  
  console.log(`\n${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('drm')} ${colors.white('web-app')}                    ${colors.dim('# Remove stopped container')}`);
  console.log(`   ${colors.command('drm')} ${colors.white('web-app database')}          ${colors.dim('# Remove multiple containers')}`);
  console.log(`   ${colors.command('drm')} ${colors.option('-f')} ${colors.white('running-app')}             ${colors.dim('# Force remove running container')}`);
  console.log(`   ${colors.command('drm')} ${colors.option('-v')} ${colors.white('web-app')}                ${colors.dim('# Remove container and volumes')}`);
  console.log(`   ${colors.command('drm')} ${colors.option('-fv')} ${colors.white('$(docker ps -aq)')}       ${colors.dim('# Force remove all containers and volumes')}`);
  
  console.log(`\n${colors.bright('⚠️  SAFETY WARNINGS:')}`);
  console.log(`   ${colors.warning('• This action is IRREVERSIBLE - containers cannot be recovered')}`);
  console.log(`   ${colors.warning('• Use -f flag carefully with running containers')}`);
  console.log(`   ${colors.warning('• -v flag will also delete associated volumes')}`);
  
  console.log(`\n${colors.bright('🔄 WORKFLOW:')}`);
  console.log(`   ${colors.dim('1. Verify containers exist and are stopped')}`);
  console.log(`   ${colors.dim('2. Stop containers if --force is used')}`);
  console.log(`   ${colors.dim('3. Remove containers from Docker')}`);
  console.log(`   ${colors.dim('4. Remove associated volumes if --volumes is used')}`);
  
  console.log(`\n${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dps')}      - List containers`);
  console.log(`   ${colors.command('dpsa')}     - List all containers`);
  console.log(`   ${colors.command('dstop')}    - Stop running containers`);
  console.log(`   ${colors.command('dprune')}   - Clean up unused containers`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-containers')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);
const containers = [];
const dockerArgs = ['rm'];

for (const arg of args) {
  if (arg === '-f' || arg === '--force') {
    dockerArgs.push('-f');
  } else if (arg === '-v' || arg === '--volumes') {
    dockerArgs.push('-v');
  } else if (arg === '-l' || arg === '--link') {
    dockerArgs.push('-l');
  } else if (arg.startsWith('-') && arg.length > 2) {
    // Handle combined flags like -fv
    for (let i = 1; i < arg.length; i++) {
      const flag = arg[i];
      if (flag === 'f') dockerArgs.push('-f');
      else if (flag === 'v') dockerArgs.push('-v');
      else if (flag === 'l') dockerArgs.push('-l');
    }
  } else if (!arg.startsWith('-')) {
    containers.push(arg);
  }
}

// Validate input
if (containers.length === 0) {
  console.log(colors.error(`${icon.error} Please specify at least one container name or ID`));
  console.log(colors.dim(`Usage: ${colors.command('drm')} ${colors.option('[options]')} ${colors.option('<container>')}`));
  console.log(colors.dim(`Run '${colors.command('drm --help')}' for more information`));
  process.exit(1);
}

// Add containers to docker args
dockerArgs.push(...containers);

// Execute docker rm command with confirmation for dangerous operations
const hasForce = dockerArgs.includes('-f');
const hasVolumes = dockerArgs.includes('-v');

if (hasForce || hasVolumes) {
  console.log(colors.warning(`${icon.warning} ${hasForce ? 'Force removing' : 'Removing'} container(s): ${colors.white(containers.join(', '))}`));
  if (hasVolumes) {
    console.log(colors.warning(`${icon.warning} Associated volumes will also be removed`));
  }
} else {
  console.log(colors.info(`${icon.remove} Removing stopped container(s): ${colors.white(containers.join(', '))}`));
}

const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(colors.success(`${icon.success} Successfully removed container(s): ${colors.white(containers.join(', '))}`));
  } else {
    console.log(colors.error(`${icon.error} Failed to remove container(s)`));
    if (!hasForce) {
      console.log(colors.dim(`Tip: Use ${colors.option('-f')} flag to force remove running containers`));
    }
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(colors.error(`${icon.error} Error executing docker command: ${error.message}`));
  process.exit(1);
});
