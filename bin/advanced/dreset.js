#!/usr/bin/env node

/**
 * dreset - Reset Docker environment
 * 
 * Resets Docker environment to clean state.
 * 
 * Usage:
 *   dreset containers         # Reset containers only
 *   dreset images             # Reset images only
 *   dreset networks           # Reset networks only
 *   dreset volumes            # Reset volumes only
 *   dreset all                # Complete reset
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, scope] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!scope) {
    console.error('❌ Error: Reset scope is required');
    console.log('Usage: dreset <scope>');
    console.log('Reset Scopes:');
    console.log('  containers             # Reset containers only');
    console.log('  images                 # Reset images only');
    console.log('  networks               # Reset networks only');
    console.log('  volumes                # Reset volumes only');
    console.log('  all                    # Complete reset');
    process.exit(1);
  }
  
  const validScopes = ['containers', 'images', 'networks', 'volumes', 'all'];
  if (!validScopes.includes(scope)) {
    console.error(`❌ Error: Invalid reset scope '${scope}'`);
    console.log('Valid scopes:', validScopes.join(', '));
    process.exit(1);
  }
  
  console.log(`🐳 Resetting Docker environment: ${scope}...`);
  console.log('⚠️  This will remove Docker resources');
  
  try {
    await helper.callTool('docker-reset', { scope });
  } catch (error) {
    console.error('💥 Failed to reset environment:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
