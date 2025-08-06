#!/usr/bin/env node

/**
 * dup - Docker Compose up
 * 
 * Convenience script for 'docker-compose up'.
 * Starts all services defined in docker-compose.yml.
 * 
 * Usage:
 *   dup                        # Start services
 *   dup -f custom.yml          # Use custom compose file
 *   dup -d                     # Run in detached mode
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  console.log('🐳 Starting Docker Compose services...');
  
  let command = 'up';
  const params = { command };
  
  // Parse options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-d' || arg === '--detach') {
      command += ' -d';
      console.log('🔄 Running in detached mode');
    } else if (arg === '-f' || arg === '--file') {
      if (args[i + 1]) {
        params.filePath = args[i + 1];
        console.log(`📄 Compose file: ${params.filePath}`);
        i++; // Skip next arg
      }
    } else if (arg.startsWith('--file=')) {
      params.filePath = arg.split('=')[1];
      console.log(`📄 Compose file: ${params.filePath}`);
    }
  }
  
  params.command = command;
  
  try {
    await helper.callTool('docker-compose', params);
  } catch (error) {
    console.error('💥 Failed to start services:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
