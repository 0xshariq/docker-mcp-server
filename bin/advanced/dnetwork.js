#!/usr/bin/env node

/**
 * dnetwork - Manage Docker networks
 * 
 * Manages Docker networks with various operations.
 * 
 * Usage:
 *   dnetwork list              # List all networks
 *   dnetwork create mynet      # Create network
 *   dnetwork remove mynet      # Remove network
 *   dnetwork inspect mynet     # Inspect network
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, action, networkName, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!action) {
    console.error('❌ Error: Action is required');
    console.log('Usage: dnetwork <action> [networkName] [options]');
    console.log('Actions:');
    console.log('  list                   # List all networks');
    console.log('  create <name>          # Create network');
    console.log('  remove <name>          # Remove network');
    console.log('  inspect <name>         # Inspect network');
    process.exit(1);
  }
  
  console.log(`🐳 Managing Docker networks: ${action}...`);
  
  const params = { action };
  
  if (networkName) {
    params.networkName = networkName;
    console.log(`🌐 Network: ${networkName}`);
  }
  
  // Parse driver option for create
  if (action === 'create') {
    args.forEach(arg => {
      if (arg.startsWith('--driver=')) {
        params.driver = arg.split('=')[1];
        console.log(`🔧 Driver: ${params.driver}`);
      }
    });
  }
  
  // Validate required parameters
  if ((action === 'create' || action === 'remove' || action === 'inspect') && !networkName) {
    console.error(`❌ Error: Network name is required for ${action} action`);
    process.exit(1);
  }
  
  try {
    await helper.callTool('docker-network', params);
  } catch (error) {
    console.error('💥 Failed to manage network:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
