#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Docker MCP Server CLI Wrapper
 * 
 * This CLI provides easy access to all Docker operations through the MCP server.
 * Operations are organized into basic and advanced categories for better usability.
 * 
 * @version 1.0.0
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
    'dlogin', 'ddev', 'dclean', 'dstop', 'dreset', 'dlist'
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
      if (argsArray[0]) parsedArgs.filter = argsArray[0];
      break;
    
    case 'docker-containers':
      if (argsArray.includes('--all') || argsArray.includes('-a')) {
        parsedArgs.all = true;
      }
      const filterArg = argsArray.find(arg => !arg.startsWith('--'));
      if (filterArg) parsedArgs.filter = filterArg;
      break;
    
    case 'docker-pull':
      parsedArgs.imageName = argsArray[0];
      break;
    
    case 'docker-run':
      parsedArgs.imageName = argsArray[0];
      parsedArgs.options = {};
      
      // Parse common docker run options
      if (argsArray.includes('-d') || argsArray.includes('--detach')) {
        parsedArgs.options.detach = true;
      }
      if (argsArray.includes('--rm')) {
        parsedArgs.options.remove = true;
      }
      
      // Parse port mappings
      const portIndex = argsArray.findIndex(arg => arg === '-p' || arg === '--port');
      if (portIndex !== -1 && argsArray[portIndex + 1]) {
        parsedArgs.options.ports = [argsArray[portIndex + 1]];
      }
      
      // Parse name
      const nameIndex = argsArray.findIndex(arg => arg === '--name');
      if (nameIndex !== -1 && argsArray[nameIndex + 1]) {
        parsedArgs.options.name = argsArray[nameIndex + 1];
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
      parsedArgs.contextPath = argsArray[0];
      const tagArg = argsArray.find(arg => arg.startsWith('--tag=') || arg.startsWith('-t='));
      if (tagArg) {
        parsedArgs.tag = tagArg.split('=')[1];
      } else {
        const tagIndex = argsArray.findIndex(arg => arg === '--tag' || arg === '-t');
        if (tagIndex !== -1 && argsArray[tagIndex + 1]) {
          parsedArgs.tag = argsArray[tagIndex + 1];
        }
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
      if (argsArray[0]) parsedArgs.registryUrl = argsArray[0];
      if (argsArray[1]) parsedArgs.username = argsArray[1];
      if (argsArray[2]) parsedArgs.password = argsArray[2];
      break;
  }
  
  return parsedArgs;
}

main().catch(console.error);
