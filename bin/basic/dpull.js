#!/usr/bin/env node

/**
 * dpull - Pull Docker image
 * 
 * Pulls a Docker image from a registry.
 * 
 * Usage:
 *   dpull <imageName>          # Pull specific image
 *   dpull nginx                # Pull nginx image
 *   dpull nginx:alpine         # Pull specific tag
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, imageName, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!imageName) {
    console.error('❌ Error: Image name is required');
    console.log('Usage: dpull <imageName>');
    console.log('Example: dpull nginx');
    process.exit(1);
  }
  
  console.log(`🐳 Pulling Docker image: ${imageName}...`);
  
  try {
    await helper.callTool('docker-pull', { imageName });
  } catch (error) {
    console.error('💥 Failed to pull image:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
