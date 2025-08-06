#!/usr/bin/env node

/**
 * dpsa - List all Docker containers (including stopped)
 * 
 * Lists all Docker containers on the host system, including stopped ones.
 * This is a convenience alias for 'dps --all'.
 * 
 * Usage:
 *   dpsa                       # List all containers
 *   dpsa myapp                 # Filter all containers by name
 */

import { DockerMCPHelper } from '../docker-mcp-helper.js';

async function main() {
  const [,, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  console.log('🐳 Listing all Docker containers (including stopped)...');
  
  const params = { all: true };
  if (args[0]) {
    params.filter = args[0];
    console.log(`📋 Filter: ${args[0]}`);
  }
  
  try {
    await helper.callTool('docker-containers', params);
  } catch (error) {
    console.error('💥 Failed to list containers:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
