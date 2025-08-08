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
 * @author Docker MCP Server Team
 * @version 1.0.0
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
  dockerList
} from "./docker.js";

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
    ]
  };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "docker-images":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerImages(args))
            }
          ]
        };

      case "docker-containers":
        return {
          content: [
            {
              type: "text", 
              text: JSON.stringify(await dockerContainers(args))
            }
          ]
        };

      case "docker-pull":
        if (!args?.imageName) {
          throw new Error("imageName parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerPullImage(args))
            }
          ]
        };

      case "docker-run":
        if (!args?.imageName) {
          throw new Error("imageName parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerRunContainer(args))
            }
          ]
        };

      case "docker-logs":
        if (!args?.containerId) {
          throw new Error("containerId parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerLogs(args))
            }
          ]
        };

      case "docker-build":
        if (!args?.contextPath) {
          throw new Error("contextPath parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerBuild(args))
            }
          ]
        };

      case "docker-compose":
        if (!args?.command) {
          throw new Error("command parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerCompose(args))
            }
          ]
        };

      case "docker-network":
        if (!args?.action) {
          throw new Error("action parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerNetworks(args))
            }
          ]
        };

      case "docker-volume":
        if (!args?.action) {
          throw new Error("action parameter is required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerVolumes(args))
            }
          ]
        };

      case "docker-inspect":
        if (!args?.objectType || !args?.objectId) {
          throw new Error("objectType and objectId parameters are required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerInspect(args))
            }
          ]
        };

      case "docker-exec":
        if (!args?.containerId || !args?.command) {
          throw new Error("containerId and command parameters are required");
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerExec(args))
            }
          ]
        };

      case "docker-prune":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerPrune(args))
            }
          ]
        };

      case "docker-login":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerLogin(args))
            }
          ]
        };

      case "docker-logout":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerLogout(args))
            }
          ]
        };

      case "docker-bridge":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerBridge(args))
            }
          ]
        };

      case "docker-list":
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(await dockerList(args))
            }
          ]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
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
