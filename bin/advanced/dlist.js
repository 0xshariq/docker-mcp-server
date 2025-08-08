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

import { DockerMCPHelper } from '../docker-mcp-helper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  try {
    const helpFilePath = path.join(__dirname, '..', '..', 'help', 'advanced', 'docker-list.json');
    const helpContent = JSON.parse(fs.readFileSync(helpFilePath, 'utf8'));
    
    console.log(`\n${helpContent.name} - ${helpContent.description}\n`);
    console.log(`Usage: ${helpContent.usage}\n`);
    
    console.log('Examples:');
    helpContent.examples.forEach(example => {
      console.log(`  ${example.command.padEnd(45)} # ${example.description}`);
    });
    
    console.log('\nObject Types:');
    helpContent.object_types.forEach(type => {
      console.log(`  ${type}`);
    });
    
    console.log('\nOptions:');
    helpContent.options.forEach(option => {
      console.log(`  ${option.flag.padEnd(30)} ${option.description}`);
    });
    
    if (helpContent.notes) {
      console.log('\nNotes:');
      helpContent.notes.forEach(note => {
        console.log(`  ${note}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Help file not found or invalid:', error.message);
    process.exit(1);
  }
}

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
