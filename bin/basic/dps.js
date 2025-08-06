#!/usr/bin/env node

/**
 * dps - List Docker containers
 * 
 * Lists Docker containers on the host system.
 * 
 * Usage:
 *   dps                        # List running containers
 *   dps --all                  # List all containers (including stopped)
 *   dps myapp                  # Filter containers by name
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  const params = {};
  let showAll = false;
  let filter = null;
  
  // Parse arguments
  args.forEach(arg => {
    if (arg === '--all' || arg === '-a') {
      showAll = true;
    } else if (!arg.startsWith('--')) {
      filter = arg;
    }
  });
  
  if (showAll) {
    params.all = true;
    console.log('🐳 Listing all Docker containers...');
  } else {
    console.log('🐳 Listing running Docker containers...');
  }
  
  if (filter) {
    params.filter = filter;
    console.log(`📋 Filter: ${filter}`);
  }
  
  try {
    await helper.callTool('docker-containers', params);
  } catch (error) {
    console.error('💥 Failed to list containers:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
