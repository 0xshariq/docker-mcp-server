#!/usr/bin/env node

/**
 * Docker MCP Server - Model Context Protocol Server for Docker Operations
 * 
 * This server provides comprehensive Docker container and image management capabilities through the
 * Model Context Protocol (MCP). It exposes Docker operations as standardized tools
 * that can be used by AI assistants, CLI tools, and automation scripts.
 * 
 * Features:
 * - Complete Docker workflow support (images, containers, networks, volumes)
 * - Docker Compose operations for multi-container applications
 * - Advanced Docker operations (build, exec, logs, inspect, prune)
 * - Workflow combinations for enhanced developer productivity
 * - Comprehensive error handling with meaningful messages
 * - Timeout protection for long-running operations
 * - Input validation and sanitization
 * - Cross-platform compatibility
 * 
 * Operations:
 * • Container Operations: list, run, stop, remove, logs, exec
 * • Image Operations: list, pull, build, remove, prune
 * • Network Operations: list, create, remove, inspect
 * • Volume Operations: list, create, remove, inspect
 * • Compose Operations: up, down, build, logs, ps
 * • System Operations: prune, info, version
 * 
 * @author Sharique Chaudhary
 * @version 2.0.1
 * @license ISC
 */

// MCP (Model Context Protocol) SDK imports
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Import Docker operation functions from our docker module
import {
  dockerImages,
  dockerContainers,
  dockerPullImage,
  dockerRunContainer,
  dockerLogs,
  dockerBuild,
  dockerCompose,
  dockerNetworks,
  dockerVolumes,
  dockerInspect,
  dockerExec,
  dockerPrune,
  dockerLogin,
  dockerLogout,
  dockerBridge,
  dockerList,
  dockerPublish,
  dockerRestart,
  dockerRemove,
  dockerStart,
  dockerStop,
  dockerClean,
  dockerDev,
  dockerReset
} from "./docker";

// Initialize MCP server with enhanced metadata and capabilities
const server = new Server({
  name: "docker-mcp-server",
  version: "1.0.0",
  description: "Comprehensive Docker container and image management server for AI assistants",
  author: "Docker MCP Server Team",
  license: "ISC"
}, {
  capabilities: {
    tools: {},
    logging: {},
    experimental: {}
  }
});

// Performance and debugging utilities
const startTime = Date.now();
let operationCount = 0;

/**
 * Logs operation metrics for debugging and performance monitoring
 */
function logOperation(toolName: string, success: boolean, duration: number) {
  operationCount++;
  const uptime = Date.now() - startTime;
  console.error(`[MCP-DOCKER] ${toolName} | ${success ? 'SUCCESS' : 'ERROR'} | ${duration}ms | Uptime: ${uptime}ms | Ops: ${operationCount}`);
}

// === TOOL DEFINITIONS & SCHEMAS ===

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "docker-images",
        description: "List Docker images on the host system",
        inputSchema: {
          type: "object",
          properties: {
            filter: {
              type: "string",
              description: "Optional filter for image names"
            }
          }
        }
      },
      {
        name: "docker-containers",
        description: "List Docker containers on the host system",
        inputSchema: {
          type: "object",
          properties: {
            filter: {
              type: "string",
              description: "Optional filter for container names"
            },
            all: {
              type: "boolean",
              description: "Show all containers (default shows only running)"
            }
          }
        }
      },
      {
        name: "docker-logs",
        description: "Fetch logs for a specific Docker container",
        inputSchema: {
          type: "object",
          properties: {
            containerId: {
              type: "string",
              description: "ID of the Docker container"
            },
            tail: {
              type: "number",
              description: "Number of lines to fetch from the end of the log"
            },
            follow: {
              type: "boolean",
              description: "Follow log output"
            }
          },
          required: ["containerId"]
        }
      },
      {
        name: "docker-pull",
        description: "Pull a Docker image from a registry",
        inputSchema: {
          type: "object",
          properties: {
            imageName: {
              type: "string",
              description: "Name of the Docker image to pull"
            }
          },
          required: ["imageName"]
        }
      },
      {
        name: "docker-build",
        description: "Build a Docker image from a Dockerfile",
        inputSchema: {
          type: "object",
          properties: {
            contextPath: {
              type: "string",
              description: "Path to the build context"
            },
            dockerfilePath: {
              type: "string",
              description: "Path to the Dockerfile"
            },
            tag: {
              type: "string",
              description: "Tag for the built image"
            }
          },
          required: ["contextPath"]
        }
      },
      {
        name: "docker-compose",
        description: "Run Docker Compose commands",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "Docker Compose command to run (e.g., 'up', 'down')"
            },
            filePath: {
              type: "string",
              description: "Path to the Docker Compose file"
            },
            projectName: {
              type: "string",
              description: "Project name for Docker Compose"
            }
          },
          required: ["command"]
        }
      },
      {
        name: "docker-network",
        description: "Manage Docker networks",
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              description: "Action to perform (e.g., 'create', 'list', 'remove', 'inspect')"
            },
            networkName: {
              type: "string",
              description: "Name of the Docker network"
            },
            driver: {
              type: "string",
              description: "Network driver (for create action)"
            }
          },
          required: ["action"]
        }
      },
      {
        name: "docker-volume",
        description: "Manage Docker volumes",
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              description: "Action to perform (e.g., 'create', 'list', 'remove', 'inspect')"
            },
            volumeName: {
              type: "string",
              description: "Name of the Docker volume"
            },
            driver: {
              type: "string",
              description: "Volume driver (for create action)"
            }
          },
          required: ["action"]
        }
      },
      {
        name: "docker-run",
        description: "Run a Docker container with specified options",
        inputSchema: {
          type: "object",
          properties: {
            imageName: {
              type: "string",
              description: "Name of the Docker image to run"
            },
            options: {
              type: "object",
              properties: {
                detach: { type: "boolean", description: "Run container in detached mode" },
                remove: { type: "boolean", description: "Automatically remove container when it exits" },
                name: { type: "string", description: "Container name" },
                ports: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of port mappings (e.g., ['8080:80'])"
                },
                environment: {
                  type: "object",
                  additionalProperties: { type: "string" },
                  description: "Environment variables to set in the container"
                },
                volumes: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of volume mappings (e.g., ['/host/path:/container/path'])"
                }
              }
            }
          },
          required: ["imageName"]
        }
      },
      {
        name: "docker-inspect",
        description: "Inspect Docker objects (images, containers, networks, volumes)",
        inputSchema: {
          type: "object",
          properties: {
            objectType: {
              type: "string",
              description: "Type of object to inspect (e.g., 'image', 'container', 'network', 'volume')"
            },
            objectId: {
              type: "string",
              description: "ID or name of the Docker object to inspect"
            }
          },
          required: ["objectType", "objectId"]
        }
      },
      {
        name: "docker-exec",
        description: "Execute a command in a running Docker container",
        inputSchema: {
          type: "object",
          properties: {
            containerId: {
              type: "string",
              description: "ID of the Docker container"
            },
            command: {
              type: "string",
              description: "Command to execute inside the container"
            },
            interactive: {
              type: "boolean",
              description: "Run in interactive mode"
            }
          },
          required: ["containerId", "command"]
        }
      },
      {
        name: "docker-prune",
        description: "Remove unused Docker objects (images, containers, networks, volumes)",
        inputSchema: {
          type: "object",
          properties: {
            objectType: {
              type: "string",
              description: "Type of object to prune (e.g., 'images', 'containers', 'networks', 'volumes')"
            },
            force: {
              type: "boolean",
              description: "Force removal without confirmation"
            }
          }
        }
      },
      {
        name: "docker-login",
        description: "Log in to a Docker registry",
        inputSchema: {
          type: "object",
          properties: {
            registryUrl: {
              type: "string",
              description: "URL of the Docker registry to log in to"
            },
            username: {
              type: "string",
              description: "Username for the Docker registry"
            },
            password: {
              type: "string",
              description: "Password for the Docker registry"
            }
          }
        }
      },
      {
        name: "docker-logout",
        description: "Log out from a Docker registry",
        inputSchema: {
          type: "object",
          properties: {
            registry: {
              type: "string",
              description: "Registry to logout from (defaults to Docker Hub)"
            },
            all: {
              type: "boolean",
              description: "Logout from all registries"
            }
          }
        }
      },
      {
        name: "docker-bridge",
        description: "Manage Docker bridge networks and connections",
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              description: "Action to perform",
              enum: ["list", "inspect", "create", "remove", "connect", "disconnect", "prune"]
            },
            bridgeName: {
              type: "string",
              description: "Name of the bridge network"
            },
            containerName: {
              type: "string",
              description: "Name of the container (for connect/disconnect)"
            },
            subnet: {
              type: "string",
              description: "Subnet for the bridge network (CIDR format)"
            },
            gateway: {
              type: "string",
              description: "Gateway IP for the bridge network"
            },
            ipRange: {
              type: "string",
              description: "IP range for the bridge network"
            },
            ip: {
              type: "string",
              description: "Specific IP address for container connection"
            }
          },
          required: ["action"]
        }
      },
      {
        name: "docker-list",
        description: "List all available Docker MCP tools and CLI aliases with usage examples",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Optional category filter (basic, advanced, all)",
              enum: ["basic", "advanced", "all"]
            }
          }
        }
      },
      {
        name: "docker-publish",
        description: "Pubish the Image to the Docker Hub Registry",
        inputSchema: {
          type: "object",
          properties: {
            imageName: {
              type: "string",
              description: "Name of the Docker image to publish"
            },
            tag: {
              type: "string",
              description: "Tag to assign to the published image"
            },
            registry: {
              type: "string",
              description: "Docker registry to publish the image to"
            }
          },
          required: ["imageName", "tag", "registry"]
        }
      },
      {
        name: "docker-restart",
        description: "Restart Docker containers with optional timeout",
        inputSchema: {
          type: "object",
          properties: {
            containers: {
              type: "array",
              items: { type: "string" },
              description: "Array of container names or IDs to restart"
            },
            timeout: {
              type: "number",
              description: "Optional timeout in seconds before force killing"
            }
          },
          required: ["containers"]
        }
      },
      {
        name: "docker-remove",
        description: "Remove Docker containers with options",
        inputSchema: {
          type: "object",
          properties: {
            containers: {
              type: "array",
              items: { type: "string" },
              description: "Array of container names or IDs to remove"
            },
            force: {
              type: "boolean",
              description: "Force remove running containers"
            },
            volumes: {
              type: "boolean",
              description: "Remove associated volumes"
            }
          },
          required: ["containers"]
        }
      },
      {
        name: "docker-start",
        description: "Start Docker containers",
        inputSchema: {
          type: "object",
          properties: {
            containers: {
              type: "array",
              items: { type: "string" },
              description: "Array of container names or IDs to start"
            },
            attach: {
              type: "boolean",
              description: "Attach to container output"
            },
            interactive: {
              type: "boolean",
              description: "Keep STDIN open"
            }
          },
          required: ["containers"]
        }
      },
      {
        name: "docker-stop",
        description: "Stop Docker containers",
        inputSchema: {
          type: "object",
          properties: {
            containers: {
              type: "array",
              items: { type: "string" },
              description: "Array of container names or IDs to stop"
            },
            timeout: {
              type: "number",
              description: "Optional timeout in seconds before force killing"
            }
          },
          required: ["containers"]
        }
      },
      {
        name: "docker-clean",
        description: "Clean Docker system with different scopes",
        inputSchema: {
          type: "object",
          properties: {
            scope: {
              type: "string",
              description: "Cleanup scope (all, images, containers, volumes, networks, cache)",
              enum: ["all", "images", "containers", "volumes", "networks", "cache"]
            },
            force: {
              type: "boolean",
              description: "Force cleanup without confirmation"
            },
            includeAll: {
              type: "boolean",
              description: "Include all images, not just dangling ones"
            }
          }
        }
      },
      {
        name: "docker-dev",
        description: "Development environment management",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "Development command",
              enum: ["start", "stop", "restart", "status", "logs", "shell", "rebuild", "clean"]
            },
            service: {
              type: "string",
              description: "Optional service name for targeted operations"
            },
            options: {
              type: "object",
              description: "Additional options for the command"
            }
          },
          required: ["command"]
        }
      },
      {
        name: "docker-reset",
        description: "Reset Docker system with different levels",
        inputSchema: {
          type: "object",
          properties: {
            level: {
              type: "string",
              description: "Reset level",
              enum: ["soft", "hard", "nuclear", "factory"]
            },
            force: {
              type: "boolean",
              description: "Skip confirmation prompts"
            },
            keepVolumes: {
              type: "boolean",
              description: "Preserve named volumes"
            }
          }
        }
      }
    ]
  };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;
    switch (name) {
      case "docker-images":
        result = await dockerImages(args);
        break;

      case "docker-containers":
        result = await dockerContainers(args);
        break;

      case "docker-pull":
        if (!args?.imageName) {
          throw new Error("imageName parameter is required");
        }
        result = await dockerPullImage(args);
        break;

      case "docker-run":
        if (!args?.imageName) {
          throw new Error("imageName parameter is required");
        }
        result = await dockerRunContainer(args);
        break;

      case "docker-logs":
        if (!args?.containerId) {
          throw new Error("containerId parameter is required");
        }
        result = await dockerLogs(args);
        break;

      case "docker-build":
        if (!args?.contextPath) {
          throw new Error("contextPath parameter is required");
        }
        result = await dockerBuild(args);
        break;

      case "docker-compose":
        if (!args?.command) {
          throw new Error("command parameter is required");
        }
        result = await dockerCompose(args);
        break;

      case "docker-network":
        if (!args?.action) {
          throw new Error("action parameter is required");
        }
        result = await dockerNetworks(args);
        break;

      case "docker-volume":
        if (!args?.action) {
          throw new Error("action parameter is required");
        }
        result = await dockerVolumes(args);
        break;

      case "docker-inspect":
        if (!args?.objectType || !args?.objectId) {
          throw new Error("objectType and objectId parameters are required");
        }
        result = await dockerInspect(args);
        break;

      case "docker-exec":
        if (!args?.containerId || !args?.command) {
          throw new Error("containerId and command parameters are required");
        }
        result = await dockerExec(args);
        break;

      case "docker-prune":
        result = await dockerPrune(args);
        break;

      case "docker-login":
        result = await dockerLogin(args);
        break;

      case "docker-logout":
        result = await dockerLogout(args);
        break;

      case "docker-bridge":
        result = await dockerBridge(args);
        break;

      case "docker-list":
        result = await dockerList(args);
        break;

      case "docker-publish":
        if (!args?.imageName) {
          throw new Error("imageName parameter is required");
        }
        result = await dockerPublish(args.imageName as string, args);
        break;

      case "docker-restart":
        result = await dockerRestart((args?.containers as string[]) || [], args?.timeout as number);
        break;

      case "docker-remove":
        result = await dockerRemove((args?.containers as string[]) || [], args?.force as boolean, args?.volumes as boolean);
        break;

      case "docker-start":
        result = await dockerStart((args?.containers as string[]) || [], args?.attach as boolean, args?.interactive as boolean);
        break;

      case "docker-stop":
        result = await dockerStop((args?.containers as string[]) || [], args?.timeout as number);
        break;

      case "docker-clean":
        result = await dockerClean(args?.scope as string, args?.force as boolean, args?.includeAll as boolean);
        break;

      case "docker-dev":
        result = await dockerDev((args?.command as string) || 'status', args?.service as string, args?.options as any);
        break;

      case "docker-reset":
        result = await dockerReset(args?.level as string, args?.force as boolean, args?.keepVolumes as boolean);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Always wrap result in MCP ServerResult format
    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            message: error instanceof Error ? error.message : String(error)
          })
        }
      ],
      isError: true
    };
  }
});

// === SERVER INITIALIZATION ===

// Setup stdio transport for MCP communication
const transport = new StdioServerTransport();

// Start the MCP server and begin listening for requests
(async () => {
  await server.connect(transport);
})();
