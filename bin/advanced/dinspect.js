#!/usr/bin/env node

/**
 * dinspect - Inspect Docker resources
 * 
 * Inspects Docker containers, images, networks, or volumes in detail.
 * 
 * Usage:
 *   dinspect container myapp   # Inspect container
 *   dinspect image nginx       # Inspect image
 *   dinspect network mynet     # Inspect network
 *   dinspect volume myvol      # Inspect volume
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, resourceType, resourceName] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!resourceType || !resourceName) {
    console.error('❌ Error: Resource type and name are required');
    console.log('Usage: dinspect <resourceType> <resourceName>');
    console.log('Resource Types:');
    console.log('  container <name>       # Inspect container');
    console.log('  image <name>           # Inspect image');
    console.log('  network <name>         # Inspect network');
    console.log('  volume <name>          # Inspect volume');
    process.exit(1);
  }
  
  console.log(`🐳 Inspecting Docker ${resourceType}: ${resourceName}...`);
  
  try {
    await helper.callTool('docker-inspect', { 
      resourceType,
      resourceName 
    });
  } catch (error) {
    console.error('💥 Failed to inspect resource:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
