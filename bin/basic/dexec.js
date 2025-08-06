#!/usr/bin/env node

/**
 * dexec - Execute command in Docker container
 * 
 * Executes a command inside a running Docker container.
 * 
 * Usage:
 *   dexec <containerId> <command>       # Execute command
 *   dexec mycontainer bash              # Open bash shell
 *   dexec mycontainer ls -la            # List files
 *   dexec mycontainer -it bash          # Interactive bash
 */

import { DockerMCPHelper } from('../docker-mcp-helper.js');

async function main() {
  const [,, containerId, ...commandArgs] = process.argv;
  const helper = new DockerMCPHelper();
  
  if (!containerId) {
    console.error('❌ Error: Container ID or name is required');
    console.log('Usage: dexec <containerId> <command>');
    console.log('Examples:');
    console.log('  dexec mycontainer bash         # Open bash shell');
    console.log('  dexec mycontainer ls -la       # List files');
    console.log('  dexec mycontainer -it bash     # Interactive bash');
    process.exit(1);
  }
  
  if (commandArgs.length === 0) {
    console.error('❌ Error: Command is required');
    console.log('Usage: dexec <containerId> <command>');
    process.exit(1);
  }
  
  let interactive = false;
  let actualCommand = commandArgs;
  
  // Check for interactive flag
  if (commandArgs[0] === '-it' || commandArgs[0] === '-i') {
    interactive = true;
    actualCommand = commandArgs.slice(1);
    console.log('🔄 Running in interactive mode');
  }
  
  const command = actualCommand.join(' ');
  console.log(`🐳 Executing command in container ${containerId}: ${command}`);
  
  const params = {
    containerId,
    command,
    interactive
  };
  
  try {
    await helper.callTool('docker-exec', params);
  } catch (error) {
    console.error('💥 Failed to execute command:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
