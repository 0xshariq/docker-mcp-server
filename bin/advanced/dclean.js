#!/usr/bin/env node

/**
 * dclean - Clean Docker system
 * 
 * Comprehensive Docker cleanup with various options.
 * 
 * Usage:
 *   dclean light              # Light cleanup (containers only)
 *   dclean medium             # Medium cleanup (containers + images)
 *   dclean deep               # Deep cleanup (everything)
 *   dclean all                # Complete system cleanup
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, level] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!level) {
    console.error('❌ Error: Cleanup level is required');
    console.log('Usage: dclean <level>');
    console.log('Cleanup Levels:');
    console.log('  light                  # Light cleanup (containers only)');
    console.log('  medium                 # Medium cleanup (containers + images)');
    console.log('  deep                   # Deep cleanup (everything)');
    console.log('  all                    # Complete system cleanup');
    process.exit(1);
  }
  
  const validLevels = ['light', 'medium', 'deep', 'all'];
  if (!validLevels.includes(level)) {
    console.error(`❌ Error: Invalid cleanup level '${level}'`);
    console.log('Valid levels:', validLevels.join(', '));
    process.exit(1);
  }
  
  console.log(`🐳 Docker cleanup: ${level} level...`);
  console.log('⚠️  This will remove Docker resources');
  
  try {
    await helper.callTool('docker-clean', { level });
  } catch (error) {
    console.error('💥 Failed to clean system:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
