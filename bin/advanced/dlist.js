#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if help is requested
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  try {
    const helpFilePath = path.join(__dirname, '..', '..', 'help', 'advanced', 'docker-list.json');
    const helpContent = JSON.parse(fs.readFileSync(helpFilePath, 'utf8'));
    
    console.log(`\n${helpContent.name} - ${helpContent.description}\n`);
    console.log(`Usage: ${helpContent.usage}\n`);
    
    console.log('Examples:');
    helpContent.examples.forEach(example => {
      console.log(`  ${example.command.padEnd(50)} # ${example.description}`);
    });
    
    console.log('\nObject Types:');
    helpContent.object_types.forEach(type => {
      console.log(`  ${type}`);
    });
    
    console.log('\nOptions:');
    helpContent.options.forEach(option => {
      console.log(`  ${option.flag.padEnd(30)} ${option.description}`);
    });
    
    if (helpContent.use_cases) {
      console.log('\nUse Cases:');
      helpContent.use_cases.forEach(useCase => {
        console.log(`  ${useCase}`);
      });
    }
    
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

/**
 * dlist - Comprehensive Docker MCP Server command and alias listing
 * 
 * Shows all available Docker commands, aliases, and their help information
 * with the new decentralized help system features.
 */

const BASIC_COMMANDS = [
  {
    name: 'docker-run',
    aliases: ['drun'],
    description: 'Run a Docker container with comprehensive options',
    category: 'Container Operations',
    helpFile: 'help/basic/docker-run.json'
  },
  {
    name: 'docker-build', 
    aliases: ['dbuild'],
    description: 'Build Docker images from Dockerfile',
    category: 'Image Management',
    helpFile: 'help/basic/docker-build.json'
  },
  {
    name: 'docker-images',
    aliases: ['dimages'],
    description: 'List Docker images with filtering options',
    category: 'Image Management', 
    helpFile: 'help/basic/docker-images.json'
  },
  {
    name: 'docker-containers',
    aliases: ['dps', 'dpsa'],
    description: 'List Docker containers with detailed information',
    category: 'Container Operations',
    helpFile: 'help/basic/docker-containers.json'
  },
  {
    name: 'docker-pull',
    aliases: ['dpull'],
    description: 'Pull Docker images from registries',
    category: 'Image Management',
    helpFile: 'help/basic/docker-pull.json'
  },
  {
    name: 'docker-logs',
    aliases: ['dlogs'],
    description: 'View container logs with advanced filtering',
    category: 'Container Operations',
    helpFile: 'help/basic/docker-logs.json'
  },
  {
    name: 'docker-exec',
    aliases: ['dexec'],
    description: 'Execute commands in running containers',
    category: 'Container Operations',
    helpFile: 'help/basic/docker-exec.json'
  }
];

const ADVANCED_COMMANDS = [
  {
    name: 'docker-compose',
    aliases: ['dcompose', 'dup', 'ddown'],
    description: 'Multi-container Docker application management',
    category: 'Orchestration',
    helpFile: 'help/advanced/docker-compose.json'
  },
  {
    name: 'docker-network',
    aliases: ['dnetwork'],
    description: 'Docker network management and configuration',
    category: 'Networking',
    helpFile: 'help/advanced/docker-network.json'
  },
  {
    name: 'docker-volume',
    aliases: ['dvolume'],
    description: 'Docker volume management and persistence',
    category: 'Storage',
    helpFile: 'help/advanced/docker-volume.json'
  },
  {
    name: 'docker-inspect',
    aliases: ['dinspect'],
    description: 'Inspect Docker objects with formatted output',
    category: 'Information',
    helpFile: 'help/advanced/docker-inspect.json'
  },
  {
    name: 'docker-login',
    aliases: ['dlogin'],
    description: 'Secure registry authentication (username only)',
    category: 'Registry Operations',
    helpFile: 'help/advanced/docker-login.json'
  },
  {
    name: 'docker-logout',
    aliases: ['dlogout'],
    description: 'Secure registry logout and credential cleanup',
    category: 'Registry Operations',
    helpFile: 'help/advanced/docker-logout.json'
  },
  {
    name: 'docker-publish',
    aliases: ['dpublish'],
    description: 'Publish Docker images to registries (Docker Hub, etc.)',
    category: 'Registry Operations',
    helpFile: 'help/advanced/docker-publish.json'
  },
  {
    name: 'docker-prune',
    aliases: ['dprune'],
    description: 'Remove unused Docker objects safely',
    category: 'System Maintenance',
    helpFile: 'help/advanced/docker-prune.json'
  },
  {
    name: 'docker-bridge',
    aliases: ['dbridge'],
    description: 'Docker bridge network management',
    category: 'Networking',
    helpFile: 'help/advanced/docker-bridge.json'
  },
  {
    name: 'docker-clean',
    aliases: ['dclean'],
    description: 'Comprehensive Docker environment cleanup',
    category: 'System Maintenance',
    helpFile: 'help/advanced/docker-clean.json'
  },
  {
    name: 'docker-reset',
    aliases: ['dreset'],
    description: 'Complete Docker environment reset',
    category: 'System Recovery',
    helpFile: 'help/advanced/docker-reset.json'
  },
  {
    name: 'docker-stop',
    aliases: ['dstop'],
    description: 'Advanced container stopping with batch operations',
    category: 'Container Operations',
    helpFile: 'help/advanced/docker-stop.json'
  },
  {
    name: 'docker-list',
    aliases: ['dlist'],
    description: 'Comprehensive Docker object listing (this command)',
    category: 'Information Display',
    helpFile: 'help/advanced/docker-list.json'
  }
];

const WORKFLOW_COMMANDS = [
  {
    name: 'docker-dev',
    aliases: ['ddev'],
    description: 'Development-focused Docker operations',
    category: 'Development Workflows',
    helpFile: 'help/workflows/docker-dev.json'
  }
];

function displayCommandList(commands, title, showHelp = false) {
  console.log(`\n🔧 ${title}\n${'='.repeat(title.length + 4)}`);
  
  commands.forEach((cmd, index) => {
    const aliasText = cmd.aliases.map(alias => `${alias}`).join(', ');
    const categoryEmoji = getCategoryEmoji(cmd.category);
    
    console.log(`\n${index + 1}. ${categoryEmoji} ${cmd.name}`);
    console.log(`   Aliases: ${aliasText}`);
    console.log(`   Category: ${cmd.category}`);
    console.log(`   Description: ${cmd.description}`);
    
    if (showHelp) {
      console.log(`   Help: ${cmd.aliases[0]} --help`);
      const helpPath = path.join(__dirname, '..', '..', cmd.helpFile);
      if (fs.existsSync(helpPath)) {
        console.log(`   📚 Help Available: ✅`);
      } else {
        console.log(`   📚 Help Available: ❌`);
      }
    }
  });
}

function getCategoryEmoji(category) {
  const emojiMap = {
    'Container Operations': '📦',
    'Image Management': '🖼️',
    'Registry Operations': '🔐',
    'Orchestration': '🎭',
    'Networking': '🔗',
    'Storage': '💾',
    'Information': '📊',
    'System Maintenance': '🧹',
    'System Recovery': '🚨',
    'Information Display': '📋',
    'Development Workflows': '🛠️'
  };
  return emojiMap[category] || '⚙️';
}

function displaySummary() {
  const totalCommands = BASIC_COMMANDS.length + ADVANCED_COMMANDS.length + WORKFLOW_COMMANDS.length;
  const totalAliases = [...BASIC_COMMANDS, ...ADVANCED_COMMANDS, ...WORKFLOW_COMMANDS]
    .reduce((sum, cmd) => sum + cmd.aliases.length, 0);
  
  console.log('\n📊 Docker MCP Server Command Summary');
  console.log('=====================================');
  console.log(`Total Commands: ${totalCommands}`);
  console.log(`Total Aliases: ${totalAliases}`);
  console.log(`Basic Operations: ${BASIC_COMMANDS.length}`);
  console.log(`Advanced Operations: ${ADVANCED_COMMANDS.length}`);
  console.log(`Workflow Commands: ${WORKFLOW_COMMANDS.length}`);
}

function displayHelpSystemFeatures() {
  console.log('\n💡 Help System Features');
  console.log('=======================');
  console.log('✅ Every command supports --help and -h flags');
  console.log('✅ Comprehensive examples and usage patterns');
  console.log('✅ Security warnings for sensitive operations');
  console.log('✅ Best practices and troubleshooting tips');
  console.log('✅ JSON-based help files for consistency');
  console.log('✅ Category-specific information and options');
  console.log('✅ Cross-platform compatibility notes');
}

async function main() {
  console.log('🐳 Docker MCP Server - Command & Alias Directory');
  console.log('================================================');
  
  // Parse arguments
  const showBasic = args.includes('--basic');
  const showAdvanced = args.includes('--advanced');
  const showWorkflows = args.includes('--workflows');
  const showHelp = args.includes('--show-help');
  const showSummary = args.includes('--summary');
  const showFeatures = args.includes('--features');
  
  // If no specific filter, show all
  if (!showBasic && !showAdvanced && !showWorkflows && !showSummary && !showFeatures) {
    displayCommandList(BASIC_COMMANDS, 'Basic Docker Operations', showHelp);
    displayCommandList(ADVANCED_COMMANDS, 'Advanced Docker Operations', showHelp);
    displayCommandList(WORKFLOW_COMMANDS, 'Development Workflow Commands', showHelp);
    displaySummary();
    displayHelpSystemFeatures();
  } else {
    if (showBasic) {
      displayCommandList(BASIC_COMMANDS, 'Basic Docker Operations', showHelp);
    }
    if (showAdvanced) {
      displayCommandList(ADVANCED_COMMANDS, 'Advanced Docker Operations', showHelp);
    }
    if (showWorkflows) {
      displayCommandList(WORKFLOW_COMMANDS, 'Development Workflow Commands', showHelp);
    }
    if (showSummary) {
      displaySummary();
    }
    if (showFeatures) {
      displayHelpSystemFeatures();
    }
  }
  
  console.log('\n🚀 Usage Examples:');
  console.log('dlist --basic              # Show basic commands only');
  console.log('dlist --advanced           # Show advanced commands only');
  console.log('dlist --workflows          # Show workflow commands only');
  console.log('dlist --show-help          # Show help availability status');
  console.log('dlist --summary            # Show command summary only');
  console.log('dlist --features           # Show help system features');
  console.log('dlist --help               # Show detailed help for dlist');
  
  console.log('\n💡 Try any command with --help to see detailed usage!');
  console.log('Example: drun --help, dcompose -h, dclean --help');
}

// Check if we should forward to the main CLI or handle locally
if (args.length === 0 || args.some(arg => ['--basic', '--advanced', '--workflows', '--show-help', '--summary', '--features'].includes(arg))) {
  // Handle locally with our improved listing
  main().catch(console.error);
} else {
  // Forward to main CLI for any other arguments
  const aliasName = path.basename(__filename, '.js');
  const cliPath = path.join(__dirname, '..', '..', 'docker-cli.js');
  const forwardArgs = [cliPath, aliasName, ...args];

  const child = spawn('node', forwardArgs, {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}
