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
  logout: '🔓',
  registry: '📦',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DLOGOUT`)} ${colors.dim('- Docker Registry Logout Manager')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Remove authentication credentials for Docker registries and secure your environment`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dlogout')} ${colors.option('[registry]')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('registry')}             Registry server to logout from (optional)`);
  
  console.log(`
${colors.bright('🏢 REGISTRY EXAMPLES:')}`);
  console.log(`   ${colors.dim('• ')}${colors.white('docker.io')}           - Docker Hub (default)`);
  console.log(`   ${colors.dim('• ')}${colors.white('ghcr.io')}             - GitHub Container Registry`);
  console.log(`   ${colors.dim('• ')}${colors.white('gcr.io')}              - Google Container Registry`);
  console.log(`   ${colors.dim('• ')}${colors.white('*.azurecr.io')}        - Azure Container Registry`);
  console.log(`   ${colors.dim('• ')}${colors.white('myregistry.com:5000')} - Custom registry with port`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dlogout')}                             ${colors.dim('# Logout from Docker Hub')}`);
  console.log(`   ${colors.command('dlogout')} ${colors.white('ghcr.io')}                     ${colors.dim('# Logout from GitHub Container Registry')}`);
  console.log(`   ${colors.command('dlogout')} ${colors.white('gcr.io')}                      ${colors.dim('# Logout from Google Container Registry')}`);
  console.log(`   ${colors.command('dlogout')} ${colors.white('myregistry.com')}              ${colors.dim('# Logout from custom registry')}`);
  console.log(`   ${colors.command('dlogout')} ${colors.white('registry.gitlab.com')}         ${colors.dim('# Logout from GitLab Container Registry')}`);
  
  console.log(`
${colors.bright('🔐 SECURITY BENEFITS:')}`);
  console.log(`   ${colors.dim('• Removes stored authentication tokens')}`);
  console.log(`   ${colors.dim('• Prevents unauthorized access to private repositories')}`);
  console.log(`   ${colors.dim('• Essential for shared or temporary environments')}`);
  console.log(`   ${colors.dim('• Good practice for CI/CD pipelines')}`);
  
  console.log(`
${colors.bright('💡 WHEN TO LOGOUT:')}`);
  console.log(`   ${colors.dim('• After finishing work with private registries')}`);
  console.log(`   ${colors.dim('• Before switching between different accounts')}`);
  console.log(`   ${colors.dim('• On shared development machines')}`);
  console.log(`   ${colors.dim('• At the end of CI/CD pipeline jobs')}`);
  console.log(`   ${colors.dim('• When troubleshooting authentication issues')}`);
  
  console.log(`
${colors.bright('🔄 WORKFLOW TIPS:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dlogin')} ${colors.dim('to authenticate before')} ${colors.command('dpush')} ${colors.dim('operations')}`);
  console.log(`   ${colors.dim('• Logout after completing push/pull operations')}`);
  console.log(`   ${colors.dim('• Multiple registries can be logged into simultaneously')}`);
  console.log(`   ${colors.dim('• Logout only affects the specified registry')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dlogin')}    - Login to registries`);
  console.log(`   ${colors.command('dpush')}     - Push images to registry`);
  console.log(`   ${colors.command('dpull')}     - Pull images from registry`);
  console.log(`   ${colors.command('dimages')}   - List local images`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-logout')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

// Show what will be executed
let registryInfo = 'Docker Hub';
if (args.length > 0) {
  registryInfo = args[0];
}

console.log(`${colors.info(`${icon.logout} Logging out from registry: ${colors.white(registryInfo)}`)}`);

// Execute docker logout command
const dockerArgs = ['logout', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Successfully logged out from ${registryInfo}`)}`);
    console.log(colors.dim('Authentication credentials removed'));
  } else {
    console.log(`\n${colors.warning(`${icon.warning} Logout completed with warnings`)}`);
    console.log(colors.dim('You may not have been logged into this registry'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker logout: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is installed and running'));
  process.exit(1);
});
