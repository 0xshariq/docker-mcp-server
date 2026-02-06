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
  login: '🔐',
  registry: '📦',
  success: '✅',
  error: '❌',
  warning: '⚠️'
};

// Help system with enhanced styling
const helpArgs = ['--help', '-h'];
if (process.argv.slice(2).some(arg => helpArgs.includes(arg))) {
  console.log(`
${colors.title(`${icon.docker} DLOGIN`)} ${colors.dim('- Docker Registry Login Manager')}
`);
  
  console.log(`${colors.bright('📋 DESCRIPTION:')}`);
  console.log(`   Authenticate to Docker registries to enable push/pull operations for private repositories`);
  
  console.log(`
${colors.bright('🔧 USAGE:')}`);
  console.log(`   ${colors.command('dlogin')} ${colors.option('[options]')} ${colors.option('[registry]')}`);
  
  console.log(`
${colors.bright('📝 OPTIONS:')}`);
  console.log(`   ${colors.option('-h, --help')}           Show this help message`);
  console.log(`   ${colors.option('-u, --username')} ${colors.white('USER')}  Username for authentication`);
  console.log(`   ${colors.option('-p, --password')} ${colors.white('PASS')}  Password for authentication`);
  console.log(`   ${colors.option('--password-stdin')}     Read password from stdin`);
  
  console.log(`
${colors.bright('🏢 SUPPORTED REGISTRIES:')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('Docker Hub')}         - ${colors.white('docker.io')} (default)`);
  console.log(`   ${colors.dim('• ')}${colors.option('GitHub Container Registry')} - ${colors.white('ghcr.io')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('Amazon ECR')}         - ${colors.white('*.dkr.ecr.region.amazonaws.com')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('Google Container Registry')} - ${colors.white('gcr.io')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('Azure Container Registry')} - ${colors.white('*.azurecr.io')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('Harbor')}             - ${colors.white('your-harbor-instance.com')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('Custom Registries')}  - Any Docker-compatible registry`);
  
  console.log(`
${colors.bright('💡 EXAMPLES:')}`);
  console.log(`   ${colors.command('dlogin')}                              ${colors.dim('# Login to Docker Hub (interactive)')}`);
  console.log(`   ${colors.command('dlogin')} ${colors.option('-u myuser')}                   ${colors.dim('# Login to Docker Hub with username')}`);
  console.log(`   ${colors.command('dlogin')} ${colors.white('ghcr.io')}                      ${colors.dim('# Login to GitHub Container Registry')}`);
  console.log(`   ${colors.command('dlogin')} ${colors.option('-u myuser')} ${colors.white('ghcr.io')}           ${colors.dim('# Login to GHCR with username')}`);
  console.log(`   ${colors.command('dlogin')} ${colors.white('myregistry.com:5000')}          ${colors.dim('# Login to custom registry')}`);
  console.log(`   ${colors.command('echo $PASSWORD | dlogin --password-stdin')} ${colors.dim('# Login with piped password')}`);
  
  console.log(`
${colors.bright('🔐 AUTHENTICATION METHODS:')}`);
  console.log(`   ${colors.dim('• ')}${colors.option('Interactive')}       - Prompted for username/password`);
  console.log(`   ${colors.dim('• ')}${colors.option('Command line')}      - Using -u and -p flags`);
  console.log(`   ${colors.dim('• ')}${colors.option('Environment')}       - Using DOCKER_USERNAME/DOCKER_PASSWORD`);
  console.log(`   ${colors.dim('• ')}${colors.option('Stdin')}             - Using --password-stdin for secure input`);
  console.log(`   ${colors.dim('• ')}${colors.option('Token-based')}       - For registries supporting token auth`);
  
  console.log(`
${colors.bright('🔒 SECURITY BEST PRACTICES:')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('--password-stdin')} ${colors.dim('instead of -p for sensitive passwords')}`);
  console.log(`   ${colors.dim('• Create access tokens instead of using main account passwords')}`);
  console.log(`   ${colors.dim('• Use')} ${colors.command('dlogout')} ${colors.dim('when done to remove stored credentials')}`);
  console.log(`   ${colors.dim('• Store credentials securely in CI/CD environment variables')}`);
  
  console.log(`
${colors.bright('📚 RELATED COMMANDS:')}`);
  console.log(`   ${colors.command('dlogout')}   - Logout from registries`);
  console.log(`   ${colors.command('dpush')}     - Push images to registry`);
  console.log(`   ${colors.command('dpull')}     - Pull images from registry`);
  console.log(`   ${colors.command('dimages')}   - List local images`);
  
  console.log(`\n${colors.dim('💼 MCP Tool: docker-login')}`);
  process.exit(0);
}

// Parse arguments
const args = process.argv.slice(2);

// Show what will be executed
let registryInfo = 'Docker Hub';
if (args.length > 0 && !args[args.length - 1].startsWith('-')) {
  const registry = args[args.length - 1];
  registryInfo = registry;
}

console.log(`${colors.info(`${icon.login} Logging into registry: ${colors.white(registryInfo)}`)}`);
console.log(colors.dim('You may be prompted for username and password...'));

// Execute docker login command
const dockerArgs = ['login', ...args];
const child = spawn('docker', dockerArgs, {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log(`\n${colors.success(`${icon.success} Successfully logged into ${registryInfo}`)}`);
    console.log(colors.dim(`Credentials stored. Use '${colors.command('dlogout')}' to logout when done.`));
  } else {
    console.log(`\n${colors.error(`${icon.error} Login failed`)}`);
    console.log(colors.dim('Check your username, password, and registry URL'));
  }
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.log(`${colors.error(`${icon.error} Error executing docker login: ${error.message}`)}`);
  console.log(colors.dim('Make sure Docker is installed and running'));
  process.exit(1);
});
