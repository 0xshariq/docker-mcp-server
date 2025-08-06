#!/usr/bin/env node

/**
 * drun - Run Docker container
 * 
 * Runs a Docker container with optional configuration.
 * 
 * Usage:
 *   drun <imageName>                    # Run container
 *   drun nginx -p 80:80                 # Run with port mapping
 *   drun nginx -d --name webserver      # Run detached with name
 *   drun nginx -e ENV=prod              # Run with environment variable
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, imageName, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!imageName) {
    console.error('❌ Error: Image name is required');
    console.log('Usage: drun <imageName> [options]');
    console.log('Examples:');
    console.log('  drun nginx                     # Basic run');
    console.log('  drun nginx -p 80:80            # With port mapping');
    console.log('  drun nginx -d --name web       # Detached with name');
    process.exit(1);
  }
  
  console.log(`🐳 Running Docker container from image: ${imageName}...`);
  
  // Parse options
  const options = {};
  const ports = [];
  const environment = {};
  const volumes = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-d' || arg === '--detach') {
      options.detach = true;
    } else if (arg === '--rm') {
      options.remove = true;
    } else if (arg === '-p' || arg === '--port') {
      if (args[i + 1]) {
        ports.push(args[i + 1]);
        i++; // Skip next arg
      }
    } else if (arg === '--name') {
      if (args[i + 1]) {
        options.name = args[i + 1];
        i++; // Skip next arg
      }
    } else if (arg === '-e' || arg === '--env') {
      if (args[i + 1] && args[i + 1].includes('=')) {
        const [key, value] = args[i + 1].split('=');
        environment[key] = value;
        i++; // Skip next arg
      }
    } else if (arg === '-v' || arg === '--volume') {
      if (args[i + 1]) {
        volumes.push(args[i + 1]);
        i++; // Skip next arg
      }
    }
  }
  
  if (ports.length > 0) {
    options.ports = ports;
    console.log(`📡 Port mappings: ${ports.join(', ')}`);
  }
  
  if (Object.keys(environment).length > 0) {
    options.environment = environment;
    console.log(`🌍 Environment variables: ${Object.keys(environment).join(', ')}`);
  }
  
  if (volumes.length > 0) {
    options.volumes = volumes;
    console.log(`💾 Volume mappings: ${volumes.join(', ')}`);
  }
  
  if (options.detach) {
    console.log('🔄 Running in detached mode');
  }
  
  if (options.name) {
    console.log(`🏷️  Container name: ${options.name}`);
  }
  
  const params = { imageName };
  if (Object.keys(options).length > 0) {
    params.options = options;
  }
  
  try {
    await helper.callTool('docker-run', params);
  } catch (error) {
    console.error('💥 Failed to run container:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
