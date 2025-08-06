#!/usr/bin/env node

/**
 * dlogs - Show Docker container logs
 * 
 * Fetches and displays logs for a specific Docker container.
 * 
 * Usage:
 *   dlogs <containerId>         # Show all logs
 *   dlogs <containerId> --tail=50    # Show last 50 lines
 *   dlogs <containerId> -f      # Follow log output
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, containerId, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!containerId) {
    console.error('❌ Error: Container ID or name is required');
    console.log('Usage: dlogs <containerId> [options]');
    console.log('Examples:');
    console.log('  dlogs mycontainer              # Show all logs');
    console.log('  dlogs mycontainer --tail=50    # Show last 50 lines');
    console.log('  dlogs mycontainer -f           # Follow logs');
    process.exit(1);
  }
  
  console.log(`🐳 Fetching logs for container: ${containerId}...`);
  
  const params = { containerId };
  
  // Parse options
  args.forEach(arg => {
    if (arg.startsWith('--tail=')) {
      params.tail = parseInt(arg.split('=')[1]);
      console.log(`📊 Showing last ${params.tail} lines`);
    } else if (arg === '-f' || arg === '--follow') {
      params.follow = true;
      console.log('🔄 Following log output...');
    }
  });
  
  try {
    await helper.callTool('docker-logs', params);
  } catch (error) {
    console.error('💥 Failed to fetch logs:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
