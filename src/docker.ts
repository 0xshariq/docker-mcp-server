/**
 * Docker MCP Server - Docker Operations Module
 * 
 * This module contains all Docker operations exposed by the MCP server.
 * Each function implements a specific Docker workflow with comprehensive
 * error handling, validation, and safety checks.
 * 
 * Architecture:
 * - Utility functions for command execution and validation
 * - Comprehensive Docker operations grouped by functionality
 * - Consistent error handling and response formatting
 * - Timeout protection for all operations
 * - Cross-platform compatibility
 * - Advanced workflow combinations for developer productivity
 * 
 * Operations Include:
 * • Container Management: list, run, stop, remove, logs, exec
 * • Image Management: list, pull, build, remove, prune
 * • Network Management: list, create, remove, inspect
 * • Volume Management: list, create, remove, inspect
 * • Docker Compose: up, down, build, logs
 * • System Operations: prune, info, version
 * 
 * @module docker
 * @version 1.0.0
 */

// Node.js built-in modules for executing shell commands and file operations
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

// Convert callback-based exec to Promise-based for async/await support
const execAsync = promisify(exec);

// Configuration constants
const DEFAULT_TIMEOUT = 60000; // 60 seconds for Docker operations
const VALIDATION_TIMEOUT = 10000; // 10 seconds for validation checks

// Standard return type for all Docker operations - matches MCP server expectations
export interface DockerOperationResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
  metadata?: {
    operation: string;
    duration: number;
    timestamp: string;
    workingDirectory: string;
  };
}

// === UTILITY FUNCTIONS ===

/**
 * Executes Docker commands safely with enhanced error handling and timeout protection
 * @param command - The Docker command to execute
 * @param timeout - Command timeout in milliseconds
 * @returns Promise with stdout and stderr
 */
async function executeDockerCommand(
  command: string, 
  timeout: number = DEFAULT_TIMEOUT
): Promise<{ stdout: string; stderr: string }> {
  const startTime = Date.now();
  
  try {
    // Sanitize command to prevent injection attacks
    if (!command.startsWith('docker ') && !command.startsWith('docker-compose ')) {
      throw new Error('Invalid command: Only docker and docker-compose commands are allowed');
    }
    
    const result = await execAsync(command, { 
      encoding: 'utf8',
      timeout,
      env: { ...process.env, LANG: 'en_US.UTF-8' } // Ensure consistent output
    });
    
    const duration = Date.now() - startTime;
    console.error(`[DOCKER-CMD] ${command} | ${duration}ms`);
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Enhanced error messaging based on common Docker scenarios
    let errorMessage = error.message;
    
    if (error.code === 'ETIMEDOUT') {
      errorMessage = `Docker command timed out after ${timeout}ms. Try with smaller scope or check Docker daemon status.`;
    } else if (error.stderr?.includes('Cannot connect to the Docker daemon')) {
      errorMessage = 'Cannot connect to Docker daemon. Please ensure Docker is running and you have proper permissions.';
    } else if (error.stderr?.includes('permission denied')) {
      errorMessage = 'Permission denied. Please check if your user is in the docker group or run with appropriate privileges.';
    } else if (error.stderr?.includes('No such container')) {
      errorMessage = 'Container not found. Please check the container ID or name.';
    } else if (error.stderr?.includes('No such image')) {
      errorMessage = 'Image not found. Please check the image name or pull it first.';
    } else if (error.stderr?.includes('port is already allocated')) {
      errorMessage = 'Port is already in use. Please choose a different port or stop the conflicting container.';
    } else if (error.stderr?.includes('network not found')) {
      errorMessage = 'Network not found. Please check the network name or create it first.';
    } else if (error.stderr?.includes('volume not found')) {
      errorMessage = 'Volume not found. Please check the volume name or create it first.';
    }
    
    console.error(`[DOCKER-ERROR] ${command} | ${duration}ms | ${errorMessage}`);
    
    // Create a proper error object with additional properties
    const dockerError = new Error(errorMessage) as any;
    dockerError.stderr = error.stderr;
    dockerError.stdout = error.stdout;
    dockerError.code = error.code;
    throw dockerError;
  }
}

/**
 * Validates if Docker daemon is accessible
 * @returns Promise<boolean> - true if Docker is accessible
 */
async function isDockerRunning(): Promise<boolean> {
  try {
    await execAsync('docker version', { 
      timeout: VALIDATION_TIMEOUT
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a standardized response with metadata for debugging and monitoring
 * @param operation - Name of the Docker operation
 * @param text - Response text
 * @param isError - Whether this is an error response
 * @param workingDir - Working directory used
 * @param startTime - Operation start time
 * @returns DockerOperationResult with metadata
 */
function createResponse(
  operation: string,
  text: string,
  isError: boolean = false,
  workingDir: string = process.cwd(),
  startTime: number = Date.now()
): DockerOperationResult {
  const duration = Date.now() - startTime;
  
  return {
    content: [{
      type: "text",
      text
    }],
    isError,
    metadata: {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      workingDirectory: workingDir
    }
  };
}

// === DOCKER IMAGE OPERATIONS ===

/**
 * Lists Docker images on the host system
 * @param params - Parameters for filtering images
 * @returns DockerOperationResult with image list
 */
export async function dockerImages(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-images', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    let command = "docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}'";
    if (params?.filter) {
      command += ` --filter "reference=${params.filter}"`;
    }
    
    const result = await executeDockerCommand(command);
    
    if (!result.stdout.trim()) {
      return createResponse('docker-images', '📦 No Docker images found.', false, process.cwd(), startTime);
    }
    
    const message = `📦 Docker Images:\n\n${result.stdout}`;
    return createResponse('docker-images', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-images', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Lists Docker containers on the host system
 * @param params - Parameters for filtering containers
 * @returns DockerOperationResult with container list
 */
export async function dockerContainers(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-containers', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    let command = "docker ps --format 'table {{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}'";
    
    if (params?.all) {
      command += " -a";
    }
    
    if (params?.filter) {
      command += ` --filter "name=${params.filter}"`;
    }
    
    const result = await executeDockerCommand(command);
    
    if (!result.stdout.trim()) {
      const status = params?.all ? 'No Docker containers found.' : 'No running Docker containers found.';
      return createResponse('docker-containers', `🐳 ${status}`, false, process.cwd(), startTime);
    }
    
    const message = `🐳 Docker Containers:\n\n${result.stdout}`;
    return createResponse('docker-containers', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-containers', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Pulls a Docker image from a registry
 * @param params - Parameters including image name
 * @returns DockerOperationResult with pull status
 */
export async function dockerPullImage(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-pull', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    if (!params?.imageName) {
      return createResponse('docker-pull', 'Error: Image name is required.', true, process.cwd(), startTime);
    }

    const command = `docker pull "${params.imageName}"`;
    const result = await executeDockerCommand(command, 300000); // 5 minutes timeout for pulls
    
    const message = `✅ Successfully pulled image: ${params.imageName}\n\n${result.stdout}`;
    return createResponse('docker-pull', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-pull', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Runs a Docker container with specified options
 * @param params - Parameters including image name and options
 * @returns DockerOperationResult with container run status
 */
export async function dockerRunContainer(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-run', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    if (!params?.imageName) {
      return createResponse('docker-run', 'Error: Image name is required.', true, process.cwd(), startTime);
    }

    let command = 'docker run';
    
    // Add options
    if (params.options) {
      if (params.options.detach) {
        command += ' -d';
      }
      
      if (params.options.remove) {
        command += ' --rm';
      }
      
      if (params.options.name) {
        command += ` --name "${params.options.name}"`;
      }
      
      if (params.options.ports) {
        params.options.ports.forEach((port: string) => {
          command += ` -p ${port}`;
        });
      }
      
      if (params.options.volumes) {
        params.options.volumes.forEach((volume: string) => {
          command += ` -v "${volume}"`;
        });
      }
      
      if (params.options.environment) {
        Object.entries(params.options.environment).forEach(([key, value]) => {
          command += ` -e "${key}=${value}"`;
        });
      }
    }
    
    command += ` "${params.imageName}"`;
    
    const result = await executeDockerCommand(command);
    
    const message = `🚀 Successfully started container from image: ${params.imageName}\n\nContainer ID: ${result.stdout.trim()}`;
    return createResponse('docker-run', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-run', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Fetches logs for a specific Docker container
 * @param params - Parameters including container ID and options
 * @returns DockerOperationResult with container logs
 */
export async function dockerLogs(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-logs', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    if (!params?.containerId) {
      return createResponse('docker-logs', 'Error: Container ID is required.', true, process.cwd(), startTime);
    }

    let command = `docker logs "${params.containerId}"`;
    
    if (params.tail) {
      command += ` --tail ${params.tail}`;
    }
    
    if (params.follow) {
      command += ' -f';
    }
    
    const result = await executeDockerCommand(command);
    
    const message = `📋 Logs for container ${params.containerId}:\n\n${result.stdout || result.stderr || 'No logs found'}`;
    return createResponse('docker-logs', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-logs', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Builds a Docker image from a Dockerfile
 * @param params - Parameters including context path and options
 * @returns DockerOperationResult with build status
 */
export async function dockerBuild(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-build', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    if (!params?.contextPath) {
      return createResponse('docker-build', 'Error: Context path is required.', true, process.cwd(), startTime);
    }

    // Check if context path exists
    if (!fs.existsSync(params.contextPath)) {
      return createResponse('docker-build', `Error: Context path does not exist: ${params.contextPath}`, true, process.cwd(), startTime);
    }

    let command = `docker build "${params.contextPath}"`;
    
    if (params.dockerfilePath) {
      command += ` -f "${params.dockerfilePath}"`;
    }
    
    if (params.tag) {
      command += ` -t "${params.tag}"`;
    }
    
    const result = await executeDockerCommand(command, 600000); // 10 minutes timeout for builds
    
    const message = `🔨 Successfully built Docker image\n\n${result.stdout}`;
    return createResponse('docker-build', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-build', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Runs Docker Compose commands
 * @param params - Parameters including command and options
 * @returns DockerOperationResult with compose status
 */
export async function dockerCompose(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-compose', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    if (!params?.command) {
      return createResponse('docker-compose', 'Error: Docker Compose command is required.', true, process.cwd(), startTime);
    }

    let command = 'docker-compose';
    
    if (params.filePath) {
      if (!fs.existsSync(params.filePath)) {
        return createResponse('docker-compose', `Error: Compose file does not exist: ${params.filePath}`, true, process.cwd(), startTime);
      }
      command += ` -f "${params.filePath}"`;
    }
    
    if (params.projectName) {
      command += ` -p "${params.projectName}"`;
    }
    
    command += ` ${params.command}`;
    
    const result = await executeDockerCommand(command, 300000); // 5 minutes timeout
    
    const message = `🐙 Docker Compose ${params.command} completed:\n\n${result.stdout || result.stderr || 'Command executed successfully'}`;
    return createResponse('docker-compose', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-compose', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Manages Docker networks
 * @param params - Parameters including action and network details
 * @returns DockerOperationResult with network operation status
 */
export async function dockerNetworks(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-network', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    let command = '';
    let resultText = '';

    switch (params?.action) {
      case 'list':
        command = "docker network ls --format 'table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}'";
        break;
      case 'create':
        if (!params.networkName) {
          return createResponse('docker-network', 'Error: Network name is required for create action.', true, process.cwd(), startTime);
        }
        command = `docker network create`;
        if (params.driver) {
          command += ` --driver ${params.driver}`;
        }
        command += ` "${params.networkName}"`;
        break;
      case 'remove':
        if (!params.networkName) {
          return createResponse('docker-network', 'Error: Network name is required for remove action.', true, process.cwd(), startTime);
        }
        command = `docker network rm "${params.networkName}"`;
        break;
      case 'inspect':
        if (!params.networkName) {
          return createResponse('docker-network', 'Error: Network name is required for inspect action.', true, process.cwd(), startTime);
        }
        command = `docker network inspect "${params.networkName}"`;
        break;
      default:
        return createResponse('docker-network', 'Error: Invalid action. Use: list, create, remove, or inspect.', true, process.cwd(), startTime);
    }

    const result = await executeDockerCommand(command);
    
    switch (params.action) {
      case 'list':
        resultText = `🌐 Docker Networks:\n\n${result.stdout}`;
        break;
      case 'create':
        resultText = `✅ Successfully created network: ${params.networkName}\n\n${result.stdout}`;
        break;
      case 'remove':
        resultText = `🗑️ Successfully removed network: ${params.networkName}`;
        break;
      case 'inspect':
        resultText = `🔍 Network details for ${params.networkName}:\n\n${result.stdout}`;
        break;
    }
    
    return createResponse('docker-network', resultText, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-network', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Manages Docker volumes
 * @param params - Parameters including action and volume details
 * @returns DockerOperationResult with volume operation status
 */
export async function dockerVolumes(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-volume', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    let command = '';
    let resultText = '';

    switch (params?.action) {
      case 'list':
        command = "docker volume ls --format 'table {{.Driver}}\t{{.Name}}'";
        break;
      case 'create':
        if (!params.volumeName) {
          return createResponse('docker-volume', 'Error: Volume name is required for create action.', true, process.cwd(), startTime);
        }
        command = `docker volume create`;
        if (params.driver) {
          command += ` --driver ${params.driver}`;
        }
        command += ` "${params.volumeName}"`;
        break;
      case 'remove':
        if (!params.volumeName) {
          return createResponse('docker-volume', 'Error: Volume name is required for remove action.', true, process.cwd(), startTime);
        }
        command = `docker volume rm "${params.volumeName}"`;
        break;
      case 'inspect':
        if (!params.volumeName) {
          return createResponse('docker-volume', 'Error: Volume name is required for inspect action.', true, process.cwd(), startTime);
        }
        command = `docker volume inspect "${params.volumeName}"`;
        break;
      default:
        return createResponse('docker-volume', 'Error: Invalid action. Use: list, create, remove, or inspect.', true, process.cwd(), startTime);
    }

    const result = await executeDockerCommand(command);
    
    switch (params.action) {
      case 'list':
        resultText = `💾 Docker Volumes:\n\n${result.stdout}`;
        break;
      case 'create':
        resultText = `✅ Successfully created volume: ${params.volumeName}\n\n${result.stdout}`;
        break;
      case 'remove':
        resultText = `🗑️ Successfully removed volume: ${params.volumeName}`;
        break;
      case 'inspect':
        resultText = `🔍 Volume details for ${params.volumeName}:\n\n${result.stdout}`;
        break;
    }
    
    return createResponse('docker-volume', resultText, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-volume', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Inspects Docker objects (images, containers, networks, volumes)
 * @param params - Parameters including object type and ID
 * @returns DockerOperationResult with inspection details
 */
export async function dockerInspect(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-inspect', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    if (!params?.objectType || !params?.objectId) {
      return createResponse('docker-inspect', 'Error: Object type and ID are required.', true, process.cwd(), startTime);
    }

    const command = `docker ${params.objectType} inspect "${params.objectId}"`;
    const result = await executeDockerCommand(command);
    
    const message = `🔍 Inspection details for ${params.objectType} ${params.objectId}:\n\n${result.stdout}`;
    return createResponse('docker-inspect', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-inspect', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Executes a command in a running Docker container
 * @param params - Parameters including container ID and command
 * @returns DockerOperationResult with command output
 */
export async function dockerExec(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-exec', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    if (!params?.containerId || !params?.command) {
      return createResponse('docker-exec', 'Error: Container ID and command are required.', true, process.cwd(), startTime);
    }

    let command = 'docker exec';
    
    if (params.interactive) {
      command += ' -it';
    }
    
    command += ` "${params.containerId}" ${params.command}`;
    
    const result = await executeDockerCommand(command);
    
    const message = `⚡ Command executed in container ${params.containerId}:\n\nCommand: ${params.command}\nOutput:\n${result.stdout || result.stderr || 'No output'}`;
    return createResponse('docker-exec', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-exec', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Removes unused Docker objects (images, containers, networks, volumes)
 * @param params - Parameters including object type to prune
 * @returns DockerOperationResult with prune status
 */
export async function dockerPrune(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-prune', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    let command = '';
    let resultText = '';

    if (!params?.objectType) {
      // System-wide prune
      command = 'docker system prune';
      if (params?.force) {
        command += ' -f';
      }
      resultText = '🧹 System-wide cleanup completed';
    } else {
      switch (params.objectType) {
        case 'images':
          command = 'docker image prune';
          resultText = '🖼️ Unused images cleanup completed';
          break;
        case 'containers':
          command = 'docker container prune';
          resultText = '🐳 Stopped containers cleanup completed';
          break;
        case 'networks':
          command = 'docker network prune';
          resultText = '🌐 Unused networks cleanup completed';
          break;
        case 'volumes':
          command = 'docker volume prune';
          resultText = '💾 Unused volumes cleanup completed';
          break;
        default:
          return createResponse('docker-prune', 'Error: Invalid object type. Use: images, containers, networks, or volumes.', true, process.cwd(), startTime);
      }
      
      if (params?.force) {
        command += ' -f';
      }
    }

    const result = await executeDockerCommand(command);
    
    const message = `${resultText}\n\n${result.stdout || 'Cleanup completed successfully'}`;
    return createResponse('docker-prune', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-prune', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Docker login interface
 */
export interface DockerLoginParams {
  registry?: string;
  username?: string;
  password?: string;
  interactive?: boolean;
  token?: string;
}

/**
 * Logs in to a Docker registry with multiple authentication methods
 * @param params - Parameters including registry URL, credentials, or interactive mode
 * @returns DockerOperationResult with login status
 */
export async function dockerLogin(params: DockerLoginParams = {}): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-login', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    const { registry = 'docker.io', username, password, interactive = true, token } = params;
    
    let command = 'docker login';
    
    // Add registry if not default Docker Hub
    if (registry && registry !== 'docker.io') {
      command += ` ${registry}`;
    }
    
    // Handle different authentication methods
    if (token) {
      // Token-based authentication (for GitHub Container Registry, etc.)
      command += ` --username token --password-stdin`;
      
      // Execute command with stdin input
      const { spawn } = await import('child_process');
      const process = spawn('sh', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      process.stdin.write(token);
      process.stdin.end();
      
      const result = await new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => stdout += data.toString());
        process.stderr.on('data', (data) => stderr += data.toString());
        
        process.on('close', (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`Command failed with code ${code}: ${stderr}`));
          }
        });
      });
      
      const message = `🔐 Successfully logged in to ${registry} using token authentication\n\n${result.stdout}`;
      return createResponse('docker-login', message, false, process.cwd(), startTime);
    } else if (username && password) {
      // Username/password authentication
      command += ` -u "${username}" --password-stdin`;
      
      // Execute command with stdin input
      const { spawn } = await import('child_process');
      const loginProcess = spawn('sh', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      loginProcess.stdin.write(password);
      loginProcess.stdin.end();
      
      const result = await new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        loginProcess.stdout.on('data', (data) => stdout += data.toString());
        loginProcess.stderr.on('data', (data) => stderr += data.toString());
        
        loginProcess.on('close', (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`Command failed with code ${code}: ${stderr}`));
          }
        });
      });
      
      const message = `🔐 Successfully logged in to ${registry} as ${username}\n\n${result.stdout}`;
      return createResponse('docker-login', message, false, process.cwd(), startTime);
    } else if (interactive) {
      // Interactive login - shows status of current login
      const whoamiResult = await executeDockerCommand('docker system info --format "{{.Username}}"').catch(() => null);
      
      let statusMessage = `🔐 Docker Registry Login Status\n`;
      statusMessage += `${'='.repeat(40)}\n\n`;
      statusMessage += `Registry: ${registry}\n`;
      
      if (whoamiResult?.stdout?.trim()) {
        statusMessage += `Current User: ${whoamiResult.stdout.trim()}\n`;
        statusMessage += `Status: ✅ Logged in\n\n`;
        statusMessage += `💡 To login with different credentials:\n`;
        statusMessage += `   • Use: dlogin <registry> --username <user> --password <pass>\n`;
        statusMessage += `   • Use: dlogin <registry> --token <token> (for token auth)\n`;
      } else {
        statusMessage += `Status: ❌ Not logged in\n\n`;
        statusMessage += `💡 To login:\n`;
        statusMessage += `   • Docker Hub: dlogin --username <user> --password <pass>\n`;
        statusMessage += `   • Custom registry: dlogin <registry-url> --username <user> --password <pass>\n`;
        statusMessage += `   • GitHub: dlogin ghcr.io --username <user> --token <token>\n`;
        statusMessage += `   • Interactive: Run 'docker login' in terminal\n`;
      }
      
      return createResponse('docker-login', statusMessage, false, process.cwd(), startTime);
    } else {
      return createResponse('docker-login', 'Error: Either provide username/password, token, or use interactive mode.', true, process.cwd(), startTime);
    }
    
  } catch (error: any) {
    return createResponse('docker-login', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Lists all available Docker MCP tools and CLI aliases
 * Provides a comprehensive overview of available commands and their usage
 * 
 * @param params - Optional parameters (currently unused)
 * @returns Promise<DockerOperationResult> - List of all available tools and aliases
 */
export async function dockerList(params: any = {}): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    const listMessage = `
🐳 Docker MCP Server - Available Tools & CLI Aliases

═══════════════════════════════════════════════════════════════

📦 BASIC OPERATIONS (bin/basic/)
═══════════════════════════════════════════════════════════════
┌─────────────┬────────────────────────────────────────────────┐
│ Alias       │ Description                                    │
├─────────────┼────────────────────────────────────────────────┤
│ dimages     │ List all Docker images                        │
│ dps         │ List running containers                       │
│ dpsa        │ List all containers (including stopped)      │
│ dpull       │ Pull Docker images from registry             │
│ drun        │ Run Docker containers with options           │
│ dlogs       │ View container logs (with follow support)    │
│ dexec       │ Execute commands in running containers       │
│ dbuild      │ Build Docker images from Dockerfile          │
└─────────────┴────────────────────────────────────────────────┘

🔧 ADVANCED OPERATIONS (bin/advanced/)
═══════════════════════════════════════════════════════════════
┌─────────────┬────────────────────────────────────────────────┐
│ Alias       │ Description                                    │
├─────────────┼────────────────────────────────────────────────┤
│ dcompose    │ Docker Compose operations (up/down/build)     │
│ dup         │ Start services with docker-compose up        │
│ ddown       │ Stop services with docker-compose down       │
│ dnetwork    │ Manage Docker networks (create/list/remove)  │
│ dvolume     │ Manage Docker volumes (create/list/remove)   │
│ dinspect    │ Inspect Docker resources in detail           │
│ dprune      │ Clean up unused Docker resources             │
│ dlogin      │ Login to Docker registries                   │
│ ddev        │ Development container workflows              │
│ dclean      │ Comprehensive Docker system cleanup          │
│ dstop       │ Stop containers and services                 │
│ dreset      │ Reset Docker environment                     │
└─────────────┴────────────────────────────────────────────────┘

🚀 MAIN CLI COMMANDS
═══════════════════════════════════════════════════════════════
┌─────────────────────┬──────────────────────────────────────────┐
│ Command             │ Description                              │
├─────────────────────┼──────────────────────────────────────────┤
│ docker-mcp-server   │ Main CLI with all tools                 │
│ dms                 │ Short alias for docker-mcp-server       │
│ dlist               │ Show this help (list all tools)         │
└─────────────────────┴──────────────────────────────────────────┘

📖 USAGE EXAMPLES
═══════════════════════════════════════════════════════════════
• List images:           dimages
• List containers:       dps or dpsa
• Pull image:            dpull nginx:latest
• Run container:         drun -p 8080:80 nginx
• View logs:             dlogs mycontainer --follow
• Execute command:       dexec mycontainer bash
• Build image:           dbuild -t myapp .
• Start compose:         dup or dcompose up
• Stop compose:          ddown or dcompose down
• Create network:        dnetwork create mynet
• Create volume:         dvolume create myvol
• Inspect resource:      dinspect container myapp
• Clean system:          dclean all or dprune all
• Login to registry:     dlogin --username myuser

🔗 MCP TOOLS (Available via MCP Protocol)
═══════════════════════════════════════════════════════════════
• docker-images         • docker-containers      • docker-pull
• docker-run            • docker-logs            • docker-build
• docker-exec           • docker-compose         • docker-networks
• docker-volumes        • docker-inspect         • docker-prune
• docker-login          • docker-list            

💡 TIPS
═══════════════════════════════════════════════════════════════
• All commands include --help for detailed usage
• CLI aliases work globally after: npm install -g .
• MCP tools can be used in Claude Desktop or other MCP clients
• Use 'docker-mcp-server help' for interactive help
• Check server status with: docker-mcp-server status

📚 For more information, visit: https://github.com/0xshariq/docker-mcp-server
`;

    return createResponse('docker-list', listMessage.trim(), false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-list', `Error listing tools: ${error.message}`, true, process.cwd(), startTime);
  }
}