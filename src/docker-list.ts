import { spawn } from 'child_process';

/**
 * Docker List Tool - Shows all available Docker MCP aliases and tools
 */
export interface DockerListParams {
  category?: 'basic' | 'advanced' | 'all';
  format?: 'table' | 'list' | 'json';
}

export async function dockerList(params: DockerListParams = {}) {
  const { category = 'all', format = 'table' } = params;

  const basicTools = [
    { alias: 'dimages', description: 'List Docker images', usage: 'dimages [filter]' },
    { alias: 'dps', description: 'List running containers', usage: 'dps [filter]' },
    { alias: 'dpsa', description: 'List all containers (including stopped)', usage: 'dpsa [filter]' },
    { alias: 'dpull', description: 'Pull Docker image', usage: 'dpull <image>' },
    { alias: 'drun', description: 'Run Docker container', usage: 'drun <image> [options]' },
    { alias: 'dlogs', description: 'View container logs', usage: 'dlogs <container>' },
    { alias: 'dexec', description: 'Execute command in container', usage: 'dexec <container> <command>' },
    { alias: 'dbuild', description: 'Build Docker image', usage: 'dbuild <path> [tag]' }
  ];

  const advancedTools = [
    { alias: 'dcompose', description: 'Docker Compose operations', usage: 'dcompose <action> [service]' },
    { alias: 'dup', description: 'Start services with compose up', usage: 'dup [service]' },
    { alias: 'ddown', description: 'Stop services with compose down', usage: 'ddown [service]' },
    { alias: 'dnetwork', description: 'Manage Docker networks', usage: 'dnetwork <action> [name]' },
    { alias: 'dvolume', description: 'Manage Docker volumes', usage: 'dvolume <action> [name]' },
    { alias: 'dinspect', description: 'Inspect Docker resources', usage: 'dinspect <type> <name>' },
    { alias: 'dprune', description: 'Prune unused resources', usage: 'dprune <type>' },
    { alias: 'dlogin', description: 'Login to Docker registry', usage: 'dlogin [registry]' },
    { alias: 'ddev', description: 'Development workflows', usage: 'ddev <action>' },
    { alias: 'dclean', description: 'Clean Docker system', usage: 'dclean <level>' },
    { alias: 'dstop', description: 'Stop containers/services', usage: 'dstop <target>' },
    { alias: 'dreset', description: 'Reset Docker environment', usage: 'dreset [level]' }
  ];

  const cliTools = [
    { alias: 'docker-mcp-server', description: 'Main CLI interface', usage: 'docker-mcp-server <tool> [params]' },
    { alias: 'dms', description: 'Short alias for main CLI', usage: 'dms <tool> [params]' },
    { alias: 'dlist', description: 'Show this list of tools', usage: 'dlist [category]' },
    { alias: 'docker-list', description: 'Alternative alias for dlist', usage: 'docker-list [category]' }
  ];

  let toolsToShow = [];
  
  if (category === 'basic' || category === 'all') {
    toolsToShow.push(...basicTools.map(tool => ({ ...tool, category: 'Basic' })));
  }
  
  if (category === 'advanced' || category === 'all') {
    toolsToShow.push(...advancedTools.map(tool => ({ ...tool, category: 'Advanced' })));
  }
  
  if (category === 'all') {
    toolsToShow.push(...cliTools.map(tool => ({ ...tool, category: 'CLI' })));
  }

  const response = {
    success: true,
    data: {
      tools: toolsToShow,
      totalCount: toolsToShow.length,
      categories: category === 'all' ? ['Basic', 'Advanced', 'CLI'] : [category],
      format
    }
  };

  if (format === 'json') {
    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }

  let output = '';
  
  if (format === 'table') {
    output += `\n🐳 Docker MCP Server - Available Tools\n`;
    output += `${'='.repeat(80)}\n\n`;
    
    const categories = [...new Set(toolsToShow.map(tool => tool.category))];
    
    categories.forEach(cat => {
      const categoryTools = toolsToShow.filter(tool => tool.category === cat);
      output += `📁 ${cat} Tools (${categoryTools.length})\n`;
      output += `${'-'.repeat(50)}\n`;
      
      categoryTools.forEach(tool => {
        output += `${tool.alias.padEnd(20)} │ ${tool.description}\n`;
        output += `${' '.repeat(20)} │ Usage: ${tool.usage}\n\n`;
      });
    });
    
    output += `\n💡 Tips:\n`;
    output += `   • Use 'dlist basic' to show only basic tools\n`;
    output += `   • Use 'dlist advanced' to show only advanced tools\n`;
    output += `   • Use '<tool> --help' for detailed help on any tool\n`;
    output += `   • All tools support MCP protocol for AI assistant integration\n\n`;
    
  } else {
    // List format
    output += `Docker MCP Server Tools:\n\n`;
    toolsToShow.forEach(tool => {
      output += `• ${tool.alias} - ${tool.description}\n`;
    });
  }

  return {
    content: [{ type: 'text', text: output }]
  };
}
