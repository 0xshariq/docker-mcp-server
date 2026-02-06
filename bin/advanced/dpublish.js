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
  publish: '🚀',
  registry: '📦',
  upload: '⬆️',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DPUBLISH`)} ${colors.dim('- Docker Image Publisher (Push to Registry)')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Push Docker images to registries with comprehensive tagging and publishing workflows`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dpublish')} ${colors.option('[options]')} ${colors.white('IMAGE[:TAG]')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-a, --all-tags')}       Push all tagged images in the repository`);
  console.log(`   ${colors.option('-q, --quiet')}          Suppress verbose output`);
  console.log(`   ${colors.option('--disable-content-trust')} Skip image signing`);
  
  console.log(`
${colors.bright('🏢 REGISTRY FORMATS:')}`);
  console.log(`   ${colors.dim('• ')}${colors.white('docker.io/username/image:tag')}     - Docker Hub`);
  console.log(`   ${colors.dim('• ')}${colors.white('ghcr.io/username/image:tag')}       - GitHub Container Registry`);
  console.log(`   ${colors.dim('• ')}${colors.white('gcr.io/project/image:tag')}         - Google Container Registry`);
  console.log(`   ${colors.dim('• ')}${colors.white('registry.azurecr.io/image:tag')}   - Azure Container Registry`);
  console.log(`   ${colors.dim('• ')}${colors.white('myregistry.com:5000/image:tag')}   - Custom registry with port`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dpublish')} ${colors.white('myapp:latest')}                ${colors.dim('# Push to Docker Hub')}`);
  console.log(`   ${colors.command('dpublish')} ${colors.white('username/myapp:v1.0')}         ${colors.dim('# Push tagged version')}`);
  console.log(`   ${colors.command('dpublish')} ${colors.white('ghcr.io/user/myapp:latest')}   ${colors.dim('# Push to GitHub Registry')}`);
  console.log(`   ${colors.command('dpublish')} ${colors.option('-a')} ${colors.white('myapp')}                  ${colors.dim('# Push all tags of image')}`);
  console.log(`   ${colors.command('dpublish')} ${colors.white('gcr.io/myproject/app:prod')}   ${colors.dim('# Push to Google Registry')}`);
  console.log(`   ${colors.command('dpublish')} ${colors.white('localhost:5000/myapp:dev')}    ${colors.dim('# Push to local registry')}`);
  
  console.log(`
${colors.bright('🚀 PUBLISHING WORKFLOW:')}`);
  console.log(`   ${colors.dim('1.')} ${colors.command('dlogin')} ${colors.dim('to authenticate with registry')}`);
  console.log(`   ${colors.dim('2.')} ${colors.command('dbuild -t username/image:tag .')} ${colors.dim('to build image')}`);
  console.log(`   ${colors.dim('3.')} ${colors.command('dpublish username/image:tag')} ${colors.dim('to upload image')}`);
  console.log(`   ${colors.dim('4.')} ${colors.command('dlogout')} ${colors.dim('to remove credentials (optional)')}`);
  
  console.log(`
${colors.bright('🏷️ TAGGING STRATEGIES:')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('latest')}     - Current stable version`);
  console.log(`   ${colors.dim('• ')}${colors.option('v1.0.0')}     - Semantic versioning`);
  console.log(`   ${colors.dim('• ')}${colors.option('dev, staging')} - Environment-specific tags`);
  console.log(`   ${colors.dim('• ')}${colors.option('sha-abc123')}  - Git commit-based tags`);
  console.log(`   ${colors.dim('• ')}${colors.option('2024-01-15')} - Date-based tags`);
  
  console.log(`
${colors.bright('⚡ PERFORMANCE TIPS:')}`);
  console.log(`   ${colors.dim('• Use multi-stage builds to reduce image size')}`);
  console.log(`   ${colors.dim('• Layer caching speeds up subsequent pushes')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('.dockerignore')} ${colors.dim('to exclude unnecessary files')}`);
  console.log(`   ${colors.dim('• Tag multiple versions before pushing with')} ${colors.command('-a')}`);
  
  console.log(`
${colors.bright('🔒 SECURITY CONSIDERATIONS:')}`);
  console.log(`   ${colors.dim('• Never publish images with secrets or credentials')}`);
  console.log(`   ${colors.dim('• Use private registries for proprietary code')}`);
  console.log(`   ${colors.dim('• Scan images for vulnerabilities before publishing')}`);
  console.log(`   ${colors.dim('• Use content trust for image signing when available')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dlogin')}    - Login to registries`);
  console.log(`   ${colors.command('dlogout')}   - Logout from registries`);
  console.log(`   ${colors.command('dbuild')}    - Build images`);
  console.log(`   ${colors.command('dpull')}     - Pull images from registry`);
  console.log(`   ${colors.command('dimages')}   - List local images`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-push')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`${colors.error(`${icon.error} Error: Image name required`)}`);
  console.log(colors.dim(`Usage: ${colors.command('dpublish')} ${colors.white('IMAGE[:TAG]')}`));
  console.log(colors.dim(`Run '${colors.command('dpublish --help')}' for more information`));
  process.exit(1);
}

// Show what will be executed
const imageName = args[args.length - 1];
console.log(`${colors.info(`${icon.publish} Publishing Docker image: ${colors.white(imageName)}`)}`);
console.log(colors.dim('This may take a while depending on image size and network speed...'));

// Execute docker push command
const dockerArgs = ['push', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Image published successfully: ${colors.white(imageName)}`)}`);
    console.log(colors.dim('Image is now available in the registry'));
  } else if (code === 1) {
    console.log(`\n${colors.error(`${icon.error} Push failed - authentication or permission denied`)}`);
    console.log(colors.dim(`Use '${colors.command('dlogin')}' to authenticate first`));
  } else {
    console.log(`\n${colors.error(`${icon.error} Push failed`)}`);
    console.log(colors.dim('Check image name, network connection, and registry availability'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker push: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is running and image exists locally'));
  process.exit(1);
});
