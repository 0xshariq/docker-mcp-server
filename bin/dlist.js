#!/usr/bin/env node

/**
 * dlist - List all Docker MCP tools and CLI aliases
 * 
 * Shows a comprehensive overview of all available Docker commands, 
 * their descriptions, and usage examples.
 * 
 * Usage:
 *   dlist                      # Show all tools and aliases
 *   dlist --basic              # Show only basic operations
 *   dlist --advanced           # Show only advanced operations
 */

import { DockerMCPHelper } from './docker-mcp-helper.js';

async function main() {
  const [,, ...args] = process.argv;
  const helper = new DockerMCPHelper();
  
  console.log('🐳 Loading Docker MCP tools and aliases...');
  
  const params = {};
  
  // Parse category filter
  if (args.includes('--basic')) {
    params.category = 'basic';
    console.log('📦 Filtering: Basic operations only');
  } else if (args.includes('--advanced')) {
    params.category = 'advanced';
    console.log('🔧 Filtering: Advanced operations only');
  } else {
    params.category = 'all';
    console.log('📋 Showing: All available tools and aliases');
  }
  
  try {
    await helper.callTool('docker-list', params);
  } catch (error) {
    console.error('💥 Failed to list tools:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
