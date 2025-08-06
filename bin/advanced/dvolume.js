#!/usr/bin/env node

/**
 * dvolume - Manage Docker volumes
 * 
 * Manages Docker volumes with various operations.
 * 
 * Usage:
 *   dvolume list              # List all volumes
 *   dvolume create myvolume   # Create volume
 *   dvolume remove myvolume   # Remove volume
 *   dvolume inspect myvolume  # Inspect volume
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, action, volumeName, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!action) {
    console.error('❌ Error: Action is required');
    console.log('Usage: dvolume <action> [volumeName] [options]');
    console.log('Actions:');
    console.log('  list                   # List all volumes');
    console.log('  create <name>          # Create volume');
    console.log('  remove <name>          # Remove volume');
    console.log('  inspect <name>         # Inspect volume');
    process.exit(1);
  }
  
  console.log(`🐳 Managing Docker volumes: ${action}...`);
  
  const params = { action };
  
  if (volumeName) {
    params.volumeName = volumeName;
    console.log(`💾 Volume: ${volumeName}`);
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
  if ((action === 'create' || action === 'remove' || action === 'inspect') && !volumeName) {
    console.error(`❌ Error: Volume name is required for ${action} action`);
    process.exit(1);
  }
  
  try {
    await helper.callTool('docker-volume', params);
  } catch (error) {
    console.error('💥 Failed to manage volume:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
