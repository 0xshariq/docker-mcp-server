#!/usr/bin/env node

/**
 * ddown - Docker Compose down
 * 
 * Convenience script for 'docker-compose down'.
 * Stops and removes all services defined in docker-compose.yml.
 * 
 * Usage:
 *   ddown                      # Stop services
 *   ddown -f custom.yml        # Use custom compose file
 *   ddown -v                   # Remove volumes too
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  console.log('🐳 Stopping Docker Compose services...');
  
  let command = 'down';
  const params = { command };
  
  // Parse options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-v' || arg === '--volumes') {
      command += ' -v';
      console.log('💾 Removing volumes');
    } else if (arg === '--remove-orphans') {
      command += ' --remove-orphans';
      console.log('🧹 Removing orphan containers');
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
    console.error('💥 Failed to stop services:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
