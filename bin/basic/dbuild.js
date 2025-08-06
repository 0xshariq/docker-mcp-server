#!/usr/bin/env node

/**
 * dbuild - Build Docker image
 * 
 * Builds a Docker image from a Dockerfile in the specified context.
 * 
 * Usage:
 *   dbuild <contextPath>               # Build from context
 *   dbuild . --tag=myapp               # Build and tag
 *   dbuild ./app -f Dockerfile.prod    # Custom Dockerfile
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, contextPath, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!contextPath) {
    console.error('❌ Error: Context path is required');
    console.log('Usage: dbuild <contextPath> [options]');
    console.log('Examples:');
    console.log('  dbuild .                       # Build from current directory');
    console.log('  dbuild ./app --tag=myapp       # Build and tag');
    console.log('  dbuild . -f Dockerfile.prod    # Custom Dockerfile');
    process.exit(1);
  }
  
  console.log(`🐳 Building Docker image from context: ${contextPath}...`);
  
  const params = { contextPath };
  
  // Parse options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--tag=')) {
      params.tag = arg.split('=')[1];
      console.log(`🏷️  Tag: ${params.tag}`);
    } else if (arg === '-t' || arg === '--tag') {
      if (args[i + 1]) {
        params.tag = args[i + 1];
        console.log(`🏷️  Tag: ${params.tag}`);
        i++; // Skip next arg
      }
    } else if (arg === '-f' || arg === '--file') {
      if (args[i + 1]) {
        params.dockerfilePath = args[i + 1];
        console.log(`📄 Dockerfile: ${params.dockerfilePath}`);
        i++; // Skip next arg
      }
    } else if (arg.startsWith('--file=')) {
      params.dockerfilePath = arg.split('=')[1];
      console.log(`📄 Dockerfile: ${params.dockerfilePath}`);
    }
  }
  
  try {
    await helper.callTool('docker-build', params);
  } catch (error) {
    console.error('💥 Failed to build image:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
