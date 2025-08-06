#!/usr/bin/env node

/**
 * ddev - Development container workflow
 * 
 * Manages development containers with common workflows.
 * 
 * Usage:
 *   ddev start                 # Start development containers
 *   ddev stop                  # Stop development containers
 *   ddev restart               # Restart development containers
 *   ddev shell                 # Open shell in dev container
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, action, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!action) {
    console.error('❌ Error: Action is required');
    console.log('Usage: ddev <action> [options]');
    console.log('Actions:');
    console.log('  start                  # Start development containers');
    console.log('  stop                   # Stop development containers');
    console.log('  restart                # Restart development containers');
    console.log('  shell [container]      # Open shell in dev container');
    process.exit(1);
  }
  
  console.log(`🐳 Development workflow: ${action}...`);
  
  const params = { action };
  
  if (action === 'shell' && args[0]) {
    params.containerName = args[0];
    console.log(`🖥️  Container: ${args[0]}`);
  }
  
  try {
    await helper.callTool('docker-dev', params);
  } catch (error) {
    console.error('💥 Failed to execute dev workflow:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
