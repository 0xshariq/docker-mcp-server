#!/usr/bin/env node

/**
 * dimages - List Docker images
 * 
 * Lists all Docker images on the host system with optional filtering.
 * 
 * Usage:
 *   dimages                    # List all images
 *   dimages nginx              # Filter images containing 'nginx'
 */

import { DockerMCPHelper } from '../docker-mcp-helper.js';

async function main() {
  const [,, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  console.log('🐳 Listing Docker images...');
  
  const params = {};
  if (args[0]) {
    params.filter = args[0];
    console.log(`📋 Filter: ${args[0]}`);
  }
  
  try {
    await helper.callTool('docker-images', params);
  } catch (error) {
    console.error('💥 Failed to list images:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
