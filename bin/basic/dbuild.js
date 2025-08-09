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
  build: '🔧',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DBUILD`)} ${colors.dim('- Docker Image Builder')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Build Docker images from a Dockerfile with advanced options and caching`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dbuild')} ${colors.option('[options]')} ${colors.white('PATH | URL | -')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-t, --tag')} ${colors.white('NAME')}        Name and optionally tag (format: name:tag)`);
  console.log(`   ${colors.option('-f, --file')} ${colors.white('PATH')}       Path to Dockerfile (default: PATH/Dockerfile)`);
  console.log(`   ${colors.option('--no-cache')}           Do not use cache when building`);
  console.log(`   ${colors.option('--pull')}               Always attempt to pull newer version of base image`);
  console.log(`   ${colors.option('--build-arg')} ${colors.white('KEY=VAL')}   Set build-time variables`);
  console.log(`   ${colors.option('--target')} ${colors.white('STAGE')}       Set target build stage for multi-stage builds`);
  console.log(`   ${colors.option('-q, --quiet')}          Suppress build output and print image ID on success`);
  
  console.log(`
${colors.bright('� EXAMPLES:')}`);
  console.log(`   ${colors.command('dbuild')} ${colors.white('.')}                            ${colors.dim('# Build from current directory')}`);
  console.log(`   ${colors.command('dbuild')} ${colors.option('-t myapp:v1.0')} ${colors.white('.')}            ${colors.dim('# Build and tag image')}`);
  console.log(`   ${colors.command('dbuild')} ${colors.option('-f docker/Dockerfile')} ${colors.white('.')}      ${colors.dim('# Use custom Dockerfile')}`);
  console.log(`   ${colors.command('dbuild')} ${colors.option('--no-cache -t myapp')} ${colors.white('.')}       ${colors.dim('# Build without cache')}`);
  console.log(`   ${colors.command('dbuild')} ${colors.option('--build-arg NODE_ENV=prod')} ${colors.white('.')} ${colors.dim('# Pass build argument')}`);
  console.log(`   ${colors.command('dbuild')} ${colors.option('--target production')} ${colors.white('.')}       ${colors.dim('# Build specific stage')}`);
  
  console.log(`
${colors.bright('🚀 BUILD BEST PRACTICES:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('.dockerignore')} ${colors.dim('to exclude files from build context')}`);
  console.log(`   ${colors.dim('• Use multi-stage builds for smaller production images')}`);
  console.log(`   ${colors.dim('• Tag your images with meaningful versions')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('--no-cache')} ${colors.dim('for clean builds')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('drun')}      - Run the built image`);
  console.log(`   ${colors.command('dimages')}   - List built images`);
  console.log(`   ${colors.command('dpush')}     - Push image to registry`);
  console.log(`   ${colors.command('dinspect')}  - Inspect image details`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-build')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`${colors.error(`${icon.error} Error: Build context required`)}`);
  console.log(colors.dim(`Run '${colors.command('dbuild --help')}' for usage information`));
  process.exit(1);
}

// Show what will be executed
console.log(`${colors.info(`${icon.build} Building Docker image...`)}`);
console.log(colors.dim(`Building context: ${args[args.length - 1]}`));

// Execute docker build command
const dockerArgs = ['build', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Docker image built successfully`)}`);
  } else {
    console.log(`\n${colors.error(`${icon.error} Docker build failed`)}`);
    console.log(colors.dim('Check Dockerfile syntax and build context'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker build: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is running and build context exists'));
  process.exit(1);
});
