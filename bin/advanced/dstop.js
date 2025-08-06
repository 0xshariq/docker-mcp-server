#!/usr/bin/env node

/**
 * dstop - Stop Docker containers and services
 * 
 * Stops Docker containers with various options.
 * 
 * Usage:
 *   dstop myapp               # Stop specific container
 *   dstop all                 # Stop all running containers
 *   dstop --pattern web       # Stop containers matching pattern
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, target, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!target) {
    console.error('❌ Error: Target is required');
    console.log('Usage: dstop <target> [options]');
    console.log('Targets:');
    console.log('  <container>            # Stop specific container');
    console.log('  all                    # Stop all running containers');
    console.log('  --pattern <pattern>    # Stop containers matching pattern');
    process.exit(1);
  }
  
  console.log(`🐳 Stopping Docker containers: ${target}...`);
  
  const params = { target };
  
  // Parse pattern option
  if (target === '--pattern' && args[0]) {
    params.pattern = args[0];
    console.log(`🔍 Pattern: ${args[0]}`);
  }
  
  // Parse timeout option
  args.forEach(arg => {
    if (arg.startsWith('--timeout=')) {
      params.timeout = parseInt(arg.split('=')[1]);
      console.log(`⏱️  Timeout: ${params.timeout}s`);
    }
  });
  
  try {
    await helper.callTool('docker-stop', params);
  } catch (error) {
    console.error('💥 Failed to stop containers:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
