#!/usr/bin/env node

/**
 * dcompose - Docker Compose operations
 * 
 * Runs Docker Compose commands with optional configuration.
 * 
 * Usage:
 *   dcompose <command>                 # Run compose command
 *   dcompose up                        # Start services
 *   dcompose down                      # Stop services
 *   dcompose up -f docker-compose.yml  # Custom compose file
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, command, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!command) {
    console.error('❌ Error: Docker Compose command is required');
    console.log('Usage: dcompose <command> [options]');
    console.log('Examples:');
    console.log('  dcompose up                    # Start services');
    console.log('  dcompose down                  # Stop services');
    console.log('  dcompose build                 # Build services');
    console.log('  dcompose ps                    # List services');
    console.log('  dcompose logs                  # Show logs');
    process.exit(1);
  }
  
  console.log(`🐳 Running Docker Compose: ${command}...`);
  
  const params = { command };
  
  // Parse options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-f' || arg === '--file') {
      if (args[i + 1]) {
        params.filePath = args[i + 1];
        console.log(`📄 Compose file: ${params.filePath}`);
        i++; // Skip next arg
      }
    } else if (arg.startsWith('--file=')) {
      params.filePath = arg.split('=')[1];
      console.log(`📄 Compose file: ${params.filePath}`);
    } else if (arg === '-p' || arg === '--project-name') {
      if (args[i + 1]) {
        params.projectName = args[i + 1];
        console.log(`📋 Project name: ${params.projectName}`);
        i++; // Skip next arg
      }
    }
  }
  
  try {
    await helper.callTool('docker-compose', params);
  } catch (error) {
    console.error('💥 Failed to run Docker Compose:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
