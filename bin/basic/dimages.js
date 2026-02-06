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
  images: '📦',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DIMAGES`)} ${colors.dim('- Docker Images List Manager')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   List Docker images with detailed information including size, creation time, and tags`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dimages')} ${colors.option('[options]')} ${colors.option('[repository[:tag]]')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-a, --all')}            Show all images (including intermediate)`);
  console.log(`   ${colors.option('-q, --quiet')}          Only show image IDs`);
  console.log(`   ${colors.option('--no-trunc')}           Don't truncate output`);
  console.log(`   ${colors.option('--digests')}            Show digests`);
  console.log(`   ${colors.option('-f, --filter')} ${colors.white('KEY=VALUE')}  Filter output based on conditions`);
  console.log(`   ${colors.option('--format')} ${colors.white('FORMAT')}         Pretty-print using Go template`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dimages')}                         ${colors.dim('# List all images')}`);
  console.log(`   ${colors.command('dimages')} ${colors.option('-a')}                     ${colors.dim('# List all images including intermediate')}`);
  console.log(`   ${colors.command('dimages')} ${colors.option('-q')}                     ${colors.dim('# Show only image IDs')}`);
  console.log(`   ${colors.command('dimages')} ${colors.white('nginx')}                   ${colors.dim('# List nginx images only')}`);
  console.log(`   ${colors.command('dimages')} ${colors.option('--filter dangling=true')} ${colors.dim('# Show dangling images')}`);
  console.log(`   ${colors.command('dimages')} ${colors.option('--format "table {{.Repository}}:{{.Tag}}\\t{{.Size}}"')} ${colors.dim('# Custom format')}`);
  
  console.log(`
${colors.bright('🔍 FILTER OPTIONS:')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('dangling=true/false')}  - Images not tagged or referenced`);
  console.log(`   ${colors.dim('• ')}${colors.option('label=KEY')}           - Images with specific labels`);
  console.log(`   ${colors.dim('• ')}${colors.option('before=IMAGE')}        - Images created before given image`);
  console.log(`   ${colors.dim('• ')}${colors.option('since=IMAGE')}         - Images created after given image`);
  console.log(`   ${colors.dim('• ')}${colors.option('reference=PATTERN')}   - Images with repository matching pattern`);
  
  console.log(`
${colors.bright('🔄 IMAGE MANAGEMENT TIPS:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dimages --filter dangling=true')} ${colors.dim('to find unused images')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('docker image prune')} ${colors.dim('to clean up dangling images')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('--no-trunc')} ${colors.dim('to see full image IDs')}`);
  console.log(`   ${colors.dim('• Tag your images for better organization')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dbuild')}    - Build new images`);
  console.log(`   ${colors.command('drun')}      - Run containers from images`);
  console.log(`   ${colors.command('dpull')}     - Pull images from registry`);
  console.log(`   ${colors.command('dpush')}     - Push images to registry`);
  console.log(`   ${colors.command('drmi')}      - Remove images`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-images')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

// Show what will be executed
console.log(`${colors.info(`${icon.images} Listing Docker images...`)}`);

// Execute docker images command
const dockerArgs = ['images', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Images list retrieved successfully`)}`);
  } else {
    console.log(`\n${colors.error(`${icon.error} Docker images command failed`)}`);
    console.log(colors.dim('Make sure Docker is running'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker images: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is installed and running'));
  process.exit(1);
});
