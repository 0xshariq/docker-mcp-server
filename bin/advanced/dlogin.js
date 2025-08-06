#!/usr/bin/env node

/**
 * dlogin - Login to Docker registry
 * 
 * Logs into Docker registries for pulling/pushing images.
 * 
 * Usage:
 *   dlogin                     # Login to Docker Hub
 *   dlogin myregistry.com      # Login to custom registry
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, registry] = process.argv;
  const helper = new DockerMCPHelper();
  
  console.log('🐳 Logging into Docker registry...');
  
  const params = {};
  
  if (registry) {
    params.registry = registry;
    console.log(`🔐 Registry: ${registry}`);
  } else {
    console.log('🔐 Registry: Docker Hub (default)');
  }
  
  try {
    await helper.callTool('docker-login', params);
  } catch (error) {
    console.error('💥 Failed to login:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
