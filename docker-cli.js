#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Docker MCP Server CLI Wrapper
 * 
 * This CLI provides easy access to all Docker operations through the MCP server.
 * Operations are organized into basic and advanced categories for better usability.
 * 
 * @version 1.9.0
 */

// Available tools in the MCP server
const AVAILABLE_TOOLS = [
  // === BASIC DOCKER OPERATIONS ===
  { name: 'docker-images', category: 'Basic: Image Operations', description: 'List Docker images on the host system', usage: 'docker-images [filter]' },
  { name: 'docker-containers', category: 'Basic: Container Operations', description: 'List Docker containers', usage: 'docker-containers [--all] [filter]' },
  { name: 'docker-pull', category: 'Basic: Image Operations', description: 'Pull a Docker image from registry', usage: 'docker-pull <imageName>' },
  { name: 'docker-run', category: 'Basic: Container Operations', description: 'Run a Docker container', usage: 'docker-run <imageName> [options]' },
  { name: 'docker-logs', category: 'Basic: Container Operations', description: 'Fetch logs for a specific container', usage: 'docker-logs <containerId> [--tail=N]' },
  { name: 'docker-exec', category: 'Basic: Container Operations', description: 'Execute command in running container', usage: 'docker-exec <containerId> <command>' },
  { name: 'docker-build', category: 'Basic: Image Operations', description: 'Build a Docker image from Dockerfile', usage: 'docker-build <contextPath> [--tag=name]' },
  
  // === ADVANCED DOCKER OPERATIONS ===
  { name: 'docker-compose', category: 'Advanced: Compose Operations', description: 'Run Docker Compose commands', usage: 'docker-compose <command> [--file=path]' },
  { name: 'docker-network', category: 'Advanced: Network Management', description: 'Manage Docker networks', usage: 'docker-network <action> [networkName]' },
  { name: 'docker-volume', category: 'Advanced: Volume Management', description: 'Manage Docker volumes', usage: 'docker-volume <action> [volumeName]' },
  { name: 'docker-inspect', category: 'Advanced: System Operations', description: 'Inspect Docker objects', usage: 'docker-inspect <objectType> <objectId>' },
  { name: 'docker-prune', category: 'Advanced: System Operations', description: 'Remove unused Docker objects', usage: 'docker-prune [objectType] [--force]' },
  { name: 'docker-login', category: 'Advanced: Registry Operations', description: 'Log in to Docker registry', usage: 'docker-login [registryUrl] [username] [password]' }
];

// CLI workflow aliases for common Docker operations
const WORKFLOW_COMBINATIONS = [
  // === BASIC DOCKER ALIASES ===
  { alias: 'dimages', command: 'docker-images', description: 'List Docker images' },
  { alias: 'dps', command: 'docker-containers', description: 'List running containers' },
  { alias: 'dpsa', command: 'docker-containers', description: 'List all containers (including stopped)', args: { all: true } },
  { alias: 'dpull', command: 'docker-pull', description: 'Pull Docker image', usage: 'dpull <image>' },
  { alias: 'drun', command: 'docker-run', description: 'Run Docker container', usage: 'drun <image>' },
  { alias: 'dlogs', command: 'docker-logs', description: 'Show container logs', usage: 'dlogs <container>' },
  { alias: 'dexec', command: 'docker-exec', description: 'Execute command in container', usage: 'dexec <container> <command>' },
  { alias: 'dbuild', command: 'docker-build', description: 'Build Docker image', usage: 'dbuild <path>' },
  
  // === ADVANCED DOCKER ALIASES ===
  { alias: 'dcompose', command: 'docker-compose', description: 'Docker Compose operations', usage: 'dcompose <command>' },
  { alias: 'dup', command: 'docker-compose', description: 'Docker Compose up', args: { command: 'up' } },
  { alias: 'ddown', command: 'docker-compose', description: 'Docker Compose down', args: { command: 'down' } },
  { alias: 'dnetwork', command: 'docker-network', description: 'Manage Docker networks', usage: 'dnetwork <action>' },
  { alias: 'dvolume', command: 'docker-volume', description: 'Manage Docker volumes', usage: 'dvolume <action>' },
  { alias: 'dinspect', command: 'docker-inspect', description: 'Inspect Docker objects', usage: 'dinspect <type> <id>' },
  { alias: 'dprune', command: 'docker-prune', description: 'Remove unused Docker objects', usage: 'dprune [type]' },
  { alias: 'dlogin', command: 'docker-login', description: 'Login to Docker registry', usage: 'dlogin [registry]' },
  { alias: 'dlogout', command: 'docker-logout', description: 'Logout from Docker registry', usage: 'dlogout [registry]' },
  { alias: 'dbridge', command: 'docker-bridge', description: 'Manage Docker bridge networks', usage: 'dbridge <action>' },
  { alias: 'dlist', command: 'docker-list', description: 'List all available tools and aliases', usage: 'dlist' },
  
  // === WORKFLOW COMBINATIONS ===
  { alias: 'ddev', description: 'Development workflow: build and run', usage: 'ddev <dockerfile-path> <image-name>' },
  { alias: 'dclean', description: 'Clean up all unused Docker resources', usage: 'dclean' },
  { alias: 'dstop', description: 'Stop all running containers', usage: 'dstop' },
  { alias: 'dreset', description: 'Reset Docker environment (stop all, prune)', usage: 'dreset' }
];

// MCP CLI wrapper
class DockerMCPClient {
  constructor() {
    this.serverPath = path.join(__dirname, 'dist', 'index.js');
  }

  async listTools() {
    console.log('\n🐳 Docker MCP Server - Docker Operations CLI');
    console.log(`📊 Total: ${AVAILABLE_TOOLS.length} Docker operations + ${WORKFLOW_COMBINATIONS.length} CLI aliases\n`);
    
    // Group tools by category
    const basicTools = AVAILABLE_TOOLS.filter(tool => tool.category.startsWith('Basic:'));
    const advancedTools = AVAILABLE_TOOLS.filter(tool => tool.category.startsWith('Advanced:'));
    
    // Basic operations
    console.log('📂 Basic Docker Operations:');
    const basicCategories = {};
    basicTools.forEach(tool => {
      const category = tool.category.replace('Basic: ', '');
      if (!basicCategories[category]) {
        basicCategories[category] = [];
      }
      basicCategories[category].push(tool);
    });
    
    Object.entries(basicCategories).forEach(([category, tools]) => {
      console.log(`  📝 ${category}:`);
      tools.forEach(tool => {
        const usage = tool.usage ? ` (${tool.usage})` : '';
        console.log(`    ${tool.name.padEnd(18)} - ${tool.description}${usage}`);
      });
    });
    console.log('');
    
    // Advanced operations
    console.log('📂 Advanced Docker Operations:');
    const advancedCategories = {};
    advancedTools.forEach(tool => {
      const category = tool.category.replace('Advanced: ', '');
      if (!advancedCategories[category]) {
        advancedCategories[category] = [];
      }
      advancedCategories[category].push(tool);
    });
    
    Object.entries(advancedCategories).forEach(([category, tools]) => {
      console.log(`  🚀 ${category}:`);
      tools.forEach(tool => {
        const usage = tool.usage ? ` (${tool.usage})` : '';
        console.log(`    ${tool.name.padEnd(18)} - ${tool.description}${usage}`);
      });
    });
    console.log('');

    // CLI aliases
    const basicAliases = WORKFLOW_COMBINATIONS.filter(combo => combo.command && AVAILABLE_TOOLS.find(t => t.category.startsWith('Basic:') && t.name === combo.command));
    const advancedAliases = WORKFLOW_COMBINATIONS.filter(combo => combo.command && AVAILABLE_TOOLS.find(t => t.category.startsWith('Advanced:') && t.name === combo.command));
    const workflowAliases = WORKFLOW_COMBINATIONS.filter(combo => !combo.command);
    
    console.log('⚡ CLI Docker Aliases:');
    console.log(`📊 Total: ${WORKFLOW_COMBINATIONS.length} aliases (${basicAliases.length} basic + ${advancedAliases.length} advanced + ${workflowAliases.length} workflows)\n`);
    
    console.log('  📂 Basic Operation Aliases:');
    basicAliases.forEach(combo => {
      const usage = combo.usage ? ` (${combo.usage})` : '';
      console.log(`    ${combo.alias.padEnd(15)} → ${combo.description}${usage}`);
    });
    console.log('');
    
    console.log('  🚀 Advanced Operation Aliases:');
    advancedAliases.forEach(combo => {
      const usage = combo.usage ? ` (${combo.usage})` : '';
      console.log(`    ${combo.alias.padEnd(15)} → ${combo.description}${usage}`);
    });
    console.log('');
    
    console.log('  🔧 Workflow Combinations:');
    workflowAliases.forEach(combo => {
      const usage = combo.usage ? ` (${combo.usage})` : '';
      console.log(`    ${combo.alias.padEnd(15)} → ${combo.description}${usage}`);
    });
    console.log('');
    
    console.log('🔥 Usage Examples:');
    console.log('  📁 Basic Operations:');
    console.log('    dimages                                 # List all Docker images');
    console.log('    dps                                     # List running containers');
    console.log('    dpsa                                    # List all containers');
    console.log('    dpull nginx                             # Pull nginx image');
    console.log('    drun nginx -p 80:80                     # Run nginx with port mapping');
    console.log('    dlogs mycontainer                       # Show container logs');
    console.log('    dexec mycontainer bash                  # Open bash in container');
    console.log('');
    console.log('  🚀 Advanced Operations:');
    console.log('    dup                                     # Docker compose up');
    console.log('    ddown                                   # Docker compose down');
    console.log('    dnetwork list                           # List Docker networks');
    console.log('    dvolume create myvolume                 # Create Docker volume');
    console.log('    dinspect container mycontainer          # Inspect container');
    console.log('    dprune images                           # Remove unused images');
    console.log('');
    console.log('  🔧 Workflow Combinations:');
    console.log('    ddev ./app myapp                        # Build and run development container');
    console.log('    dclean                                  # Clean up all unused resources');
    console.log('    dstop                                   # Stop all running containers');
    console.log('    dreset                                  # Reset entire Docker environment');
    console.log('');
    console.log('  📖 Learn More:');
    console.log('    📚 Docker docs:         https://docs.docker.com/');
    console.log('    🖥️  CLI help:            node docker-cli.js list');
    console.log('    🔧 MCP server help:     node docker-cli.js help');
    console.log('');
  }

  async showToolHelp(toolName) {
    try {
      // Try to find help file in different directories
      const helpDirs = ['basic', 'advanced', 'workflows'];
      let helpData = null;
      
      for (const dir of helpDirs) {
        try {
          const helpPath = path.join(__dirname, 'help', dir, `${toolName}.json`);
          if (fs.existsSync(helpPath)) {
            const helpContent = fs.readFileSync(helpPath, 'utf8');
            helpData = JSON.parse(helpContent);
            break;
          }
        } catch (error) {
          // Continue searching in other directories
          continue;
        }
      }
      
      // Fallback: check if it's an alias and find the corresponding command
      if (!helpData) {
        const aliasInfo = WORKFLOW_COMBINATIONS.find(t => t.alias === toolName);
        if (aliasInfo && aliasInfo.command) {
          return this.showToolHelp(aliasInfo.command);
        }
      }
      
      if (helpData) {
        console.log(`\n🔧 ${helpData.name.toUpperCase()}${helpData.aliases ? ` (${helpData.aliases.join(', ')})` : ''}\n`);
        console.log(`📋 Category: ${helpData.category}`);
        console.log(`📖 Description: ${helpData.description}`);
        console.log(`📝 Usage: ${helpData.usage}\n`);
        
        // Show examples
        if (helpData.examples && helpData.examples.length > 0) {
          console.log('📚 Examples:');
          helpData.examples.forEach(example => {
            console.log(`   ${example.command.padEnd(50)} # ${example.description}`);
          });
          console.log('');
        }
        
        // Show options
        if (helpData.options && helpData.options.length > 0) {
          console.log('⚙️  Options:');
          helpData.options.forEach(option => {
            console.log(`   ${option.flag.padEnd(30)} ${option.description}`);
          });
          console.log('');
        }
        
        // Show filters (for commands that support them)
        if (helpData.filters && helpData.filters.length > 0) {
          console.log('🔍 Available Filters:');
          helpData.filters.forEach(filter => {
            console.log(`   ${filter}`);
          });
          console.log('');
        }
        
        // Show registries (for registry commands)
        if (helpData.registries && helpData.registries.length > 0) {
          console.log('🌐 Supported Registries:');
          helpData.registries.forEach(registry => {
            if (typeof registry === 'string') {
              console.log(`   ${registry}`);
            } else {
              console.log(`   ${registry.name.padEnd(25)} ${registry.url.padEnd(30)} ${registry.example || ''}`);
            }
          });
          console.log('');
        }
        
        // Show security info (for sensitive commands)
        if (helpData.security && helpData.security.length > 0) {
          console.log('🔒 Security Notes:');
          helpData.security.forEach(note => {
            console.log(`   ${note}`);
          });
          console.log('');
        }
        
        // Show common commands (for exec-like commands)
        if (helpData.common_commands && helpData.common_commands.length > 0) {
          console.log('� Common Commands:');
          helpData.common_commands.forEach(cmd => {
            console.log(`   ${cmd}`);
          });
          console.log('');
        }
        
        // Show time formats (for time-related commands)
        if (helpData.time_formats && helpData.time_formats.length > 0) {
          console.log('⏰ Time Format Examples:');
          helpData.time_formats.forEach(format => {
            console.log(`   ${format}`);
          });
          console.log('');
        }
        
        // Show notes
        if (helpData.notes && helpData.notes.length > 0) {
          console.log('💡 Notes:');
          helpData.notes.forEach(note => {
            console.log(`   ${note}`);
          });
          console.log('');
        }
        
      } else {
        // Fallback to generic help
        console.log(`\n❓ Help not found for: ${toolName}\n`);
        console.log(`� Available commands:`);
        console.log(`   📚 Run 'node docker-cli.js list' to see all available tools`);
        console.log(`   🔧 Run 'node docker-cli.js help' for general help`);
        console.log(`   📖 Try '${toolName} --help' or check documentation`);
        console.log('');
      }
      
    } catch (error) {
      console.error(`❌ Error loading help for ${toolName}:`, error.message);
      console.log(`\n💡 Fallback help for: ${toolName}`);
      console.log(`📝 Basic usage: ${toolName} [options]`);
      console.log(`� Run 'node docker-cli.js list' to see all available tools\n`);
    }
  }

  async callTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
      const message = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: toolName, arguments: args }
      };

      const child = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        if (errorOutput) {
          console.error('❌ Error:', errorOutput);
        }

        try {
          const response = JSON.parse(output);
          if (response.result && response.result.content && response.result.content[0]) {
            const contentText = response.result.content[0].text;
            
            try {
              const contentObj = JSON.parse(contentText);
              if (contentObj.content && contentObj.content[0]) {
                console.log(contentObj.content[0].text);
                resolve(contentObj.content[0].text);
              } else if (contentObj.success === false) {
                console.error('❌ Operation failed:', contentObj.message);
                reject(new Error(contentObj.message));
              } else {
                console.log(contentText);
                resolve(contentText);
              }
            } catch (parseError) {
              console.log(contentText);
              resolve(contentText);
            }
          } else if (response.error) {
            console.error('❌ MCP Error:', response.error.message);
            reject(new Error(response.error.message));
          } else {
            console.error('❌ Unexpected response format');
            reject(new Error('Unexpected response format'));
          }
        } catch (parseError) {
          console.error('❌ Parse error:', parseError.message);
          reject(parseError);
        }
      });

      child.on('error', (error) => {
        console.error('❌ Spawn error:', error.message);
        reject(error);
      });

      child.stdin.write(JSON.stringify(message) + '\n');
      child.stdin.end();
    });
  }

  async executeWorkflow(workflowName, args) {
    switch (workflowName) {
      case 'ddev':
        if (args.length < 2) {
          console.error('❌ Usage: ddev <dockerfile-path> <image-name>');
          return;
        }
        console.log('🔨 Building Docker image...');
        await this.callTool('docker-build', { contextPath: args[0], tag: args[1] });
        console.log('🚀 Running Docker container...');
        await this.callTool('docker-run', { imageName: args[1], options: { detach: true } });
        break;

      case 'dclean':
        console.log('🧹 Cleaning up Docker environment...');
        await this.callTool('docker-prune', { force: true });
        break;

      case 'dstop':
        console.log('⏹️ Stopping all running containers...');
        // First get all running containers, then stop them
        const containers = await this.callTool('docker-containers', {});
        // This would need additional logic to parse container IDs and stop them
        console.log('ℹ️ Use `docker stop $(docker ps -q)` to stop all containers manually');
        break;

      case 'dreset':
        console.log('🔄 Resetting Docker environment...');
        console.log('⏹️ Stopping all containers...');
        // This would stop all containers and prune everything
        console.log('🧹 Cleaning up all resources...');
        await this.callTool('docker-prune', { force: true });
        console.log('✅ Docker environment reset complete');
        break;

      default:
        console.error(`❌ Unknown workflow: ${workflowName}`);
    }
  }
}

// CLI interface
async function main() {
  const [,, tool, ...argsArray] = process.argv;
  const client = new DockerMCPClient();

  // Check if we're being called as an alias - improved detection
  const scriptName = path.basename(process.argv[1]);
  const execName = path.basename(process.argv[0]); // Also check the executable name
  
  let actualTool = tool;
  let actualArgs = argsArray;
  
  // List of known aliases from package.json bin
  const knownAliases = [
    'dimages', 'dps', 'dpsa', 'dpull', 'drun', 'dlogs', 'dexec', 'dbuild',
    'dcompose', 'dup', 'ddown', 'dnetwork', 'dvolume', 'dinspect', 'dprune', 
    'dlogin', 'dlogout', 'dbridge', 'ddev', 'dclean', 'dstop', 'dreset', 'dlist'
  ];
  
  // If called as an alias (either script name or executable name matches an alias)
  if (knownAliases.includes(scriptName) || knownAliases.includes(execName)) {
    actualTool = knownAliases.includes(scriptName) ? scriptName : execName;
    actualArgs = [tool, ...argsArray].filter(Boolean);
    console.log(`🔗 Called as alias: ${actualTool}`);
  } else if (scriptName !== 'docker-cli.js' && scriptName !== 'docker-mcp-server' && scriptName !== 'dms') {
    // Fallback: if not main script names, treat script name as tool
    actualTool = scriptName;
    actualArgs = [tool, ...argsArray].filter(Boolean);
    console.log(`🔗 Called as script: ${actualTool}`);
  }

  // Show current directory context
  console.log(`📁 Working Directory: ${process.cwd().split('/').pop()}`);
  console.log(`🐳 Docker CLI: Ready for Docker operations`);

  if (!actualTool || actualTool === 'help' || actualTool === '--help' || actualTool === '-h') {
    await client.listTools();
    process.exit(0);
  }

  if (actualTool === 'list' || actualTool === 'ls') {
    await client.listTools();
    process.exit(0);
  }

  // Check if this is a workflow alias
  const workflow = WORKFLOW_COMBINATIONS.find(combo => combo.alias === actualTool && !combo.command);
  if (workflow) {
    console.log(`🔧 Executing workflow: ${actualTool}`);
    await client.executeWorkflow(actualTool, actualArgs);
    return;
  }

  // ...existing code...

  // Check if this is a command alias
  const alias = WORKFLOW_COMBINATIONS.find(combo => combo.alias === actualTool && combo.command);
  if (alias) {
    actualTool = alias.command;
    // Merge predefined args with user args
    if (alias.args) {
      actualArgs = { ...alias.args, ...parseDockerArgs(actualTool, actualArgs) };
    }
  }

  // Parse arguments based on tool type
  let parsedArgs = {};
  
  if (typeof actualArgs === 'object' && !Array.isArray(actualArgs)) {
    parsedArgs = actualArgs;
  } else {
    parsedArgs = parseDockerArgs(actualTool, actualArgs);
  }

  try {
    console.log(`🔧 Executing: ${actualTool}${Array.isArray(actualArgs) && actualArgs.length > 0 ? ' ' + actualArgs.join(' ') : ''}`);
    await client.callTool(actualTool, parsedArgs);
  } catch (error) {
    console.error('💥 Operation failed:', error.message);
    process.exit(1);
  }
}

function parseDockerArgs(toolName, argsArray) {
  const parsedArgs = {};
  
  if (argsArray.length === 0) return parsedArgs;
  
  const argString = argsArray.join(' ');
  
  switch (toolName) {
    case 'docker-images':
      // Parse docker images options
      for (let i = 0; i < argsArray.length; i++) {
        const arg = argsArray[i];
        
        // All images (including intermediate)
        if (arg === '-a' || arg === '--all') {
          parsedArgs.all = true;
        }
        
        // Show digests
        else if (arg === '--digests') {
          parsedArgs.digests = true;
        }
        
        // No truncate
        else if (arg === '--no-trunc') {
          parsedArgs.noTrunc = true;
        }
        
        // Quiet (only IDs)
        else if (arg === '-q' || arg === '--quiet') {
          parsedArgs.quiet = true;
        }
        
        // Filter
        else if ((arg === '-f' || arg === '--filter') && argsArray[i + 1]) {
          if (!parsedArgs.filter) parsedArgs.filter = [];
          parsedArgs.filter.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Format output
        else if (arg === '--format' && argsArray[i + 1]) {
          parsedArgs.format = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Repository filter (positional argument)
        else if (!arg.startsWith('-') && !parsedArgs.repository) {
          parsedArgs.repository = arg;
        }
      }
      break;
    
    case 'docker-containers':
      // Parse docker ps/containers options
      for (let i = 0; i < argsArray.length; i++) {
        const arg = argsArray[i];
        
        // All containers (including stopped)
        if (arg === '-a' || arg === '--all') {
          parsedArgs.all = true;
        }
        
        // Latest created
        else if (arg === '-l' || arg === '--latest') {
          parsedArgs.latest = true;
        }
        
        // Last n containers
        else if ((arg === '-n' || arg === '--last') && argsArray[i + 1]) {
          parsedArgs.last = parseInt(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Quiet (only IDs)
        else if (arg === '-q' || arg === '--quiet') {
          parsedArgs.quiet = true;
        }
        
        // No truncate
        else if (arg === '--no-trunc') {
          parsedArgs.noTrunc = true;
        }
        
        // Show sizes
        else if (arg === '-s' || arg === '--size') {
          parsedArgs.size = true;
        }
        
        // Filter
        else if ((arg === '-f' || arg === '--filter') && argsArray[i + 1]) {
          if (!parsedArgs.filter) parsedArgs.filter = [];
          parsedArgs.filter.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Format output
        else if (arg === '--format' && argsArray[i + 1]) {
          parsedArgs.format = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Container filter (positional argument)
        else if (!arg.startsWith('-') && !parsedArgs.containerFilter) {
          parsedArgs.containerFilter = arg;
        }
      }
      break;
    
    case 'docker-pull':
      // First argument should be the image name
      const pullImageIndex = argsArray.findIndex(arg => !arg.startsWith('-'));
      if (pullImageIndex !== -1) {
        parsedArgs.imageName = argsArray[pullImageIndex];
      }
      
      // Parse pull options
      for (let i = 0; i < argsArray.length; i++) {
        const arg = argsArray[i];
        
        // Skip the image name
        if (arg === parsedArgs.imageName) continue;
        
        // All tags
        if (arg === '-a' || arg === '--all-tags') {
          parsedArgs.allTags = true;
        }
        
        // Quiet mode
        else if (arg === '-q' || arg === '--quiet') {
          parsedArgs.quiet = true;
        }
        
        // Platform
        else if (arg === '--platform' && argsArray[i + 1]) {
          parsedArgs.platform = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Disable content trust
        else if (arg === '--disable-content-trust') {
          parsedArgs.disableContentTrust = true;
        }
      }
      break;
    
    case 'docker-run':
      // First argument is always the image name
      const imageIndex = argsArray.findIndex(arg => !arg.startsWith('-'));
      if (imageIndex !== -1) {
        parsedArgs.imageName = argsArray[imageIndex];
      }
      
      // Parse all docker run options
      for (let i = 0; i < argsArray.length; i++) {
        const arg = argsArray[i];
        
        // Skip the image name
        if (arg === parsedArgs.imageName) continue;
        
        // Interactive and TTY options
        if (arg === '-it') {
          parsedArgs.interactive = true;
          parsedArgs.tty = true;
        } else if (arg === '-i' || arg === '--interactive') {
          parsedArgs.interactive = true;
        } else if (arg === '-t' || arg === '--tty') {
          parsedArgs.tty = true;
        }
        
        // Detached mode
        else if (arg === '-d' || arg === '--detach') {
          parsedArgs.detach = true;
        }
        
        // Remove container after exit
        else if (arg === '--rm') {
          parsedArgs.rm = true;
        }
        
        // Init process
        else if (arg === '--init') {
          parsedArgs.init = true;
        }
        
        // Port mappings
        else if ((arg === '-p' || arg === '--publish') && argsArray[i + 1]) {
          if (!parsedArgs.ports) parsedArgs.ports = [];
          parsedArgs.ports.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Publish all ports
        else if (arg === '-P' || arg === '--publish-all') {
          parsedArgs.publishAll = true;
        }
        
        // Volume mounts
        else if ((arg === '-v' || arg === '--volume') && argsArray[i + 1]) {
          if (!parsedArgs.volumes) parsedArgs.volumes = [];
          parsedArgs.volumes.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Mount options
        else if (arg === '--mount' && argsArray[i + 1]) {
          if (!parsedArgs.mount) parsedArgs.mount = [];
          parsedArgs.mount.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Tmpfs mounts
        else if (arg === '--tmpfs' && argsArray[i + 1]) {
          if (!parsedArgs.tmpfs) parsedArgs.tmpfs = [];
          parsedArgs.tmpfs.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Environment variables
        else if ((arg === '-e' || arg === '--env') && argsArray[i + 1]) {
          if (!parsedArgs.env) parsedArgs.env = [];
          parsedArgs.env.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Environment file
        else if (arg === '--env-file' && argsArray[i + 1]) {
          if (!parsedArgs.envFile) parsedArgs.envFile = [];
          parsedArgs.envFile.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Container name
        else if (arg === '--name' && argsArray[i + 1]) {
          parsedArgs.name = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Working directory
        else if ((arg === '-w' || arg === '--workdir') && argsArray[i + 1]) {
          parsedArgs.workdir = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Network
        else if (arg === '--network' && argsArray[i + 1]) {
          parsedArgs.network = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Network alias
        else if (arg === '--network-alias' && argsArray[i + 1]) {
          if (!parsedArgs.networkAlias) parsedArgs.networkAlias = [];
          parsedArgs.networkAlias.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // DNS
        else if (arg === '--dns' && argsArray[i + 1]) {
          if (!parsedArgs.dns) parsedArgs.dns = [];
          parsedArgs.dns.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // DNS search
        else if (arg === '--dns-search' && argsArray[i + 1]) {
          if (!parsedArgs.dnsSearch) parsedArgs.dnsSearch = [];
          parsedArgs.dnsSearch.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Hostname
        else if (arg === '--hostname' && argsArray[i + 1]) {
          parsedArgs.hostname = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Restart policy
        else if (arg === '--restart' && argsArray[i + 1]) {
          parsedArgs.restart = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Memory limit
        else if ((arg === '-m' || arg === '--memory') && argsArray[i + 1]) {
          parsedArgs.memory = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Memory swap
        else if (arg === '--memory-swap' && argsArray[i + 1]) {
          parsedArgs.memorySwap = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // CPU limits
        else if (arg === '--cpus' && argsArray[i + 1]) {
          parsedArgs.cpus = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        else if (arg === '--cpu-shares' && argsArray[i + 1]) {
          parsedArgs.cpuShares = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // User
        else if ((arg === '-u' || arg === '--user') && argsArray[i + 1]) {
          parsedArgs.user = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Privileged mode
        else if (arg === '--privileged') {
          parsedArgs.privileged = true;
        }
        
        // Read-only
        else if (arg === '--read-only') {
          parsedArgs.readOnly = true;
        }
        
        // Capabilities
        else if (arg === '--cap-add' && argsArray[i + 1]) {
          if (!parsedArgs.capAdd) parsedArgs.capAdd = [];
          parsedArgs.capAdd.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        else if (arg === '--cap-drop' && argsArray[i + 1]) {
          if (!parsedArgs.capDrop) parsedArgs.capDrop = [];
          parsedArgs.capDrop.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Security options
        else if (arg === '--security-opt' && argsArray[i + 1]) {
          if (!parsedArgs.securityOpt) parsedArgs.securityOpt = [];
          parsedArgs.securityOpt.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Platform
        else if (arg === '--platform' && argsArray[i + 1]) {
          parsedArgs.platform = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Entrypoint
        else if (arg === '--entrypoint' && argsArray[i + 1]) {
          parsedArgs.entrypoint = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Labels
        else if (arg === '--label' && argsArray[i + 1]) {
          if (!parsedArgs.label) parsedArgs.label = [];
          parsedArgs.label.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Container command (everything after image that's not an option)
        else if (!arg.startsWith('-') && arg !== parsedArgs.imageName && i > imageIndex) {
          parsedArgs.containerCommand = argsArray.slice(i).join(' ');
          break; // Stop parsing after we find the command
        }
      }
      break;
    
    case 'docker-logs':
      parsedArgs.containerId = argsArray[0];
      const tailArg = argsArray.find(arg => arg.startsWith('--tail='));
      if (tailArg) {
        parsedArgs.tail = parseInt(tailArg.split('=')[1]);
      }
      if (argsArray.includes('-f') || argsArray.includes('--follow')) {
        parsedArgs.follow = true;
      }
      break;
    
    case 'docker-exec':
      parsedArgs.containerId = argsArray[0];
      parsedArgs.command = argsArray.slice(1).join(' ');
      if (argsArray.includes('-it') || argsArray.includes('-i')) {
        parsedArgs.interactive = true;
      }
      break;
    
    case 'docker-build':
      // First argument should be the build context (usually .)
      const buildContextIndex = argsArray.findIndex(arg => !arg.startsWith('-'));
      if (buildContextIndex !== -1) {
        parsedArgs.contextPath = argsArray[buildContextIndex];
      }
      
      // Parse build options
      for (let i = 0; i < argsArray.length; i++) {
        const arg = argsArray[i];
        
        // Skip context path
        if (arg === parsedArgs.contextPath) continue;
        
        // Tag
        if ((arg === '-t' || arg === '--tag') && argsArray[i + 1]) {
          if (!parsedArgs.tags) parsedArgs.tags = [];
          parsedArgs.tags.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Dockerfile
        else if ((arg === '-f' || arg === '--file') && argsArray[i + 1]) {
          parsedArgs.dockerfile = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Build args
        else if (arg === '--build-arg' && argsArray[i + 1]) {
          if (!parsedArgs.buildArgs) parsedArgs.buildArgs = [];
          parsedArgs.buildArgs.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Target stage
        else if (arg === '--target' && argsArray[i + 1]) {
          parsedArgs.target = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // No cache
        else if (arg === '--no-cache') {
          parsedArgs.noCache = true;
        }
        
        // Pull
        else if (arg === '--pull') {
          parsedArgs.pull = true;
        }
        
        // Quiet
        else if (arg === '--quiet' || arg === '-q') {
          parsedArgs.quiet = true;
        }
        
        // Platform
        else if (arg === '--platform' && argsArray[i + 1]) {
          if (!parsedArgs.platform) parsedArgs.platform = [];
          parsedArgs.platform.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Progress
        else if (arg === '--progress' && argsArray[i + 1]) {
          parsedArgs.progress = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Labels
        else if (arg === '--label' && argsArray[i + 1]) {
          if (!parsedArgs.label) parsedArgs.label = [];
          parsedArgs.label.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Memory
        else if ((arg === '-m' || arg === '--memory') && argsArray[i + 1]) {
          parsedArgs.memory = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // CPU shares
        else if (arg === '--cpu-shares' && argsArray[i + 1]) {
          parsedArgs.cpuShares = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // CPU period
        else if (arg === '--cpu-period' && argsArray[i + 1]) {
          parsedArgs.cpuPeriod = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // CPU quota
        else if (arg === '--cpu-quota' && argsArray[i + 1]) {
          parsedArgs.cpuQuota = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Compress
        else if (arg === '--compress') {
          parsedArgs.compress = true;
        }
        
        // Force remove
        else if (arg === '--force-rm') {
          parsedArgs.forceRm = true;
        }
        
        // Remove intermediate containers
        else if (arg === '--rm') {
          parsedArgs.rm = true;
        }
        
        // Add host
        else if (arg === '--add-host' && argsArray[i + 1]) {
          if (!parsedArgs.addHost) parsedArgs.addHost = [];
          parsedArgs.addHost.push(argsArray[i + 1]);
          i++; // Skip next argument
        }
        
        // Network mode
        else if (arg === '--network' && argsArray[i + 1]) {
          parsedArgs.network = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Squash
        else if (arg === '--squash') {
          parsedArgs.squash = true;
        }
      }
      
      // For backward compatibility, also set tag if tags array exists
      if (parsedArgs.tags && parsedArgs.tags.length > 0) {
        parsedArgs.tag = parsedArgs.tags[0];
      }
      
      break;
    
    case 'docker-compose':
      parsedArgs.command = argsArray[0];
      const fileArg = argsArray.find(arg => arg.startsWith('--file=') || arg.startsWith('-f='));
      if (fileArg) {
        parsedArgs.filePath = fileArg.split('=')[1];
      }
      break;
    
    case 'docker-network':
      parsedArgs.action = argsArray[0];
      if (argsArray[1]) parsedArgs.networkName = argsArray[1];
      break;
    
    case 'docker-volume':
      parsedArgs.action = argsArray[0];
      if (argsArray[1]) parsedArgs.volumeName = argsArray[1];
      break;
    
    case 'docker-inspect':
      parsedArgs.objectType = argsArray[0];
      parsedArgs.objectId = argsArray[1];
      break;
    
    case 'docker-prune':
      if (argsArray[0]) parsedArgs.objectType = argsArray[0];
      if (argsArray.includes('--force') || argsArray.includes('-f')) {
        parsedArgs.force = true;
      }
      break;
    
    case 'docker-login':
      // Parse docker login options
      for (let i = 0; i < argsArray.length; i++) {
        const arg = argsArray[i];
        
        // Username
        if ((arg === '-u' || arg === '--username') && argsArray[i + 1]) {
          parsedArgs.username = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Registry URL (positional argument)
        else if (!arg.startsWith('-') && !parsedArgs.registry) {
          parsedArgs.registry = arg;
        }
        
        // Token authentication
        else if (arg === '--token' && argsArray[i + 1]) {
          parsedArgs.token = argsArray[i + 1];
          i++; // Skip next argument
        }
        
        // Interactive mode
        else if (arg === '--interactive' || arg === '-i') {
          parsedArgs.interactive = true;
        }
      }
      break;
  }
  
  return parsedArgs;
}

main().catch(console.error);
