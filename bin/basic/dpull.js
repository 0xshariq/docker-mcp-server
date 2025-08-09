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
  pull: '⬇️',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DPULL`)} ${colors.dim('- Docker Image Downloader')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Download or update Docker images from registries with comprehensive options`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dpull')} ${colors.option('[options]')} ${colors.white('IMAGE[:TAG]')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-a, --all-tags')}       Pull all tagged images in repository`);
  console.log(`   ${colors.option('-q, --quiet')}          Suppress verbose output`);
  console.log(`   ${colors.option('--disable-content-trust')} Skip image verification`);
  console.log(`   ${colors.option('--platform')} ${colors.white('PLATFORM')}  Set platform if server is multi-platform capable`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dpull')} ${colors.white('ubuntu')}                    ${colors.dim('# Pull latest ubuntu image')}`);
  console.log(`   ${colors.command('dpull')} ${colors.white('ubuntu:20.04')}             ${colors.dim('# Pull specific tag')}`);
  console.log(`   ${colors.command('dpull')} ${colors.white('nginx:alpine')}             ${colors.dim('# Pull alpine variant')}`);
  console.log(`   ${colors.command('dpull')} ${colors.white('ghcr.io/user/myapp:v1.0')} ${colors.dim('# Pull from GitHub Registry')}`);
  console.log(`   ${colors.command('dpull')} ${colors.option('-a')} ${colors.white('nginx')}                ${colors.dim('# Pull all nginx tags')}`);
  console.log(`   ${colors.command('dpull')} ${colors.option('--platform linux/arm64')} ${colors.white('node')} ${colors.dim('# Pull for specific platform')}`);
  
  console.log(`
${colors.bright('🌐 REGISTRY SUPPORT:')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('Docker Hub')}         - Default registry (docker.io)`);
  console.log(`   ${colors.dim('• ')}${colors.option('GitHub Container Registry')} - ghcr.io`);
  console.log(`   ${colors.dim('• ')}${colors.option('Google Container Registry')} - gcr.io`);
  console.log(`   ${colors.dim('• ')}${colors.option('Amazon ECR')}         - *.dkr.ecr.region.amazonaws.com`);
  console.log(`   ${colors.dim('• ')}${colors.option('Custom Registries')}  - Any Docker-compatible registry`);
  
  console.log(`
${colors.bright('⚡ PERFORMANCE TIPS:')}`);
  console.log(`   ${colors.dim('• Layer caching speeds up subsequent pulls')}`);
  console.log(`   ${colors.dim('• Use specific tags instead of "latest" for reproducibility')}`);
  console.log(`   ${colors.dim('• Multi-platform images may be larger')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('--quiet')} ${colors.dim('to reduce output in scripts')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('drun')}      - Run pulled images`);
  console.log(`   ${colors.command('dimages')}   - List local images`);
  console.log(`   ${colors.command('dpush')}     - Push images to registry`);
  console.log(`   ${colors.command('dlogin')}    - Login to private registries`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-pull')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`${colors.error(`${icon.error} Error: Image name required`)}`);
  console.log(colors.dim(`Usage: ${colors.command('dpull')} ${colors.white('IMAGE[:TAG]')}`));
  console.log(colors.dim(`Run '${colors.command('dpull --help')}' for more information`));
  process.exit(1);
}

// Show what will be executed
const imageName = args[args.length - 1];
console.log(`${colors.info(`${icon.pull} Pulling Docker image: ${colors.white(imageName)}`)}`);
console.log(colors.dim('This may take a while depending on image size and network speed...'));

// Execute docker pull command
const child = spawn('docker', ['pull', ...args], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Image pulled successfully: ${colors.white(imageName)}`)}`);
    console.log(colors.dim(`Use '${colors.command('drun')} ${colors.white(imageName)}' to run the image`));
  } else {
    console.log(`\n${colors.error(`${icon.error} Failed to pull image: ${colors.white(imageName)}`)}`);
    console.log(colors.dim('Check image name, network connection, and registry availability'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker pull: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is installed and running'));
  process.exit(1);
});
