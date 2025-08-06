#!/usr/bin/env node

/**
 * dprune - Prune Docker resources
 * 
 * Removes unused Docker containers, images, networks, and volumes.
 * 
 * Usage:
 *   dprune containers         # Remove stopped containers
 *   dprune images             # Remove unused images
 *   dprune networks           # Remove unused networks
 *   dprune volumes            # Remove unused volumes
 *   dprune all                # Remove all unused resources
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, resourceType] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!resourceType) {
    console.error('❌ Error: Resource type is required');
    console.log('Usage: dprune <resourceType>');
    console.log('Resource Types:');
    console.log('  containers             # Remove stopped containers');
    console.log('  images                 # Remove unused images');
    console.log('  networks               # Remove unused networks');
    console.log('  volumes                # Remove unused volumes');
    console.log('  all                    # Remove all unused resources');
    process.exit(1);
  }
  
  const validTypes = ['containers', 'images', 'networks', 'volumes', 'all'];
  if (!validTypes.includes(resourceType)) {
    console.error(`❌ Error: Invalid resource type '${resourceType}'`);
    console.log('Valid types:', validTypes.join(', '));
    process.exit(1);
  }
  
  console.log(`🐳 Pruning Docker ${resourceType}...`);
  console.log('⚠️  This will remove unused resources');
  
  try {
    await helper.callTool('docker-prune', { resourceType });
  } catch (error) {
    console.error('💥 Failed to prune resources:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
