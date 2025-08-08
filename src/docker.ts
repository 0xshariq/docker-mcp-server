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

    let command = 'docker images';
    
    // Show all images (including intermediate)
    if (params?.all || params?.a) {
      command += ' -a';
    }
    
    // Show digests
    if (params?.digests) {
      command += ' --digests';
    }
    
    // Filters
    if (params?.filter || params?.f) {
      const filters = params.filter || params.f;
      if (Array.isArray(filters)) {
        filters.forEach(filter => command += ` --filter "${filter}"`);
      } else if (params?.filter && typeof params.filter === 'string') {
        command += ` --filter "reference=${params.filter}"`;
      } else {
        command += ` --filter "${filters}"`;
      }
    }
    
    // Format output
    if (params?.format) {
      command += ` --format "${params.format}"`;
    } else {
      command += " --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedSince}}\t{{.Size}}'";
    }
    
    // No truncate
    if (params?.noTrunc) {
      command += ' --no-trunc';
    }
    
    // Quiet mode (only IDs)
    if (params?.quiet || params?.q) {
      command += ' -q';
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

    let command = 'docker ps';
    
    // Show all containers (including stopped)
    if (params?.all || params?.a) {
      command += ' -a';
    }
    
    // Filters
    if (params?.filter || params?.f) {
      const filters = params.filter || params.f;
      if (Array.isArray(filters)) {
        filters.forEach(filter => command += ` --filter "${filter}"`);
      } else if (typeof filters === 'string' && !filters.includes('=')) {
        // Legacy support for name filter
        command += ` --filter "name=${filters}"`;
      } else {
        command += ` --filter "${filters}"`;
      }
    }
    
    // Format output
    if (params?.format) {
      command += ` --format "${params.format}"`;
    } else {
      command += " --format 'table {{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}'";
    }
    
    // Last n containers
    if (params?.last || params?.n) {
      command += ` -n ${params.last || params.n}`;
    }
    
    // Latest created container
    if (params?.latest || params?.l) {
      command += ' -l';
    }
    
    // No truncate
    if (params?.noTrunc) {
      command += ' --no-trunc';
    }
    
    // Quiet mode (only IDs)
    if (params?.quiet || params?.q) {
      command += ' -q';
    }
    
    // Show sizes
    if (params?.size || params?.s) {
      command += ' -s';
    }
    
    const result = await executeDockerCommand(command);
    
    if (!result.stdout.trim()) {
      const status = params?.all || params?.a ? 'No Docker containers found.' : 'No running Docker containers found.';
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

    let command = 'docker pull';
    
    // All tags option
    if (params.allTags || params.a) {
      command += ' -a';
    }
    
    // Disable content trust
    if (params.disableContentTrust) {
      command += ' --disable-content-trust';
    }
    
    // Platform option
    if (params.platform) {
      command += ` --platform ${params.platform}`;
    }
    
    // Quiet mode
    if (params.quiet || params.q) {
      command += ' -q';
    }
    
    command += ` "${params.imageName}"`;
    
    const result = await executeDockerCommand(command, 300000); // 5 minutes timeout for pulls
    
    const message = `✅ Successfully pulled image: ${params.imageName}\n\n${result.stdout}`;
    return createResponse('docker-pull', message, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-pull', `Error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Runs a Docker container with comprehensive options and modes
 * @param params - Parameters including image name and all docker run options
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
    
    // Interactive and TTY options
    if (params.interactive || params.it) {
      command += ' -it';
    } else {
      if (params.i) command += ' -i';
      if (params.t || params.tty) command += ' -t';
    }
    
    // Detached mode
    if (params.detach || params.d) {
      command += ' -d';
    }
    
    // Remove container after exit
    if (params.rm || params.remove) {
      command += ' --rm';
    }
    
    // Init process
    if (params.init) {
      command += ' --init';
    }
    
    // Port mappings
    if (params.ports || params.p || params.publish) {
      const ports = params.ports || params.p || params.publish;
      if (Array.isArray(ports)) {
        ports.forEach(port => command += ` -p ${port}`);
      } else {
        command += ` -p ${ports}`;
      }
    }
    
    // Publish all ports
    if (params.P || params.publishAll) {
      command += ' -P';
    }
    
    // Volume mounts
    if (params.volumes || params.v || params.volume) {
      const volumes = params.volumes || params.v || params.volume;
      if (Array.isArray(volumes)) {
        volumes.forEach(volume => command += ` -v "${volume}"`);
      } else {
        command += ` -v "${volumes}"`;
      }
    }
    
    // Mount options (advanced volume mounts)
    if (params.mount) {
      if (Array.isArray(params.mount)) {
        params.mount.forEach((mount: string) => command += ` --mount ${mount}`);
      } else {
        command += ` --mount ${params.mount}`;
      }
    }
    
    // Tmpfs mounts
    if (params.tmpfs) {
      if (Array.isArray(params.tmpfs)) {
        params.tmpfs.forEach((tmpfs: string) => command += ` --tmpfs ${tmpfs}`);
      } else {
        command += ` --tmpfs ${params.tmpfs}`;
      }
    }
    
    // Environment variables
    if (params.env || params.e || params.environment) {
      const envVars = params.env || params.e || params.environment;
      if (Array.isArray(envVars)) {
        envVars.forEach(env => command += ` -e ${env}`);
      } else if (typeof envVars === 'object') {
        Object.entries(envVars).forEach(([key, value]) => {
          command += ` -e "${key}=${value}"`;
        });
      } else {
        command += ` -e ${envVars}`;
      }
    }
    
    // Environment file
    if (params.envFile || params.envfile) {
      const envFile = params.envFile || params.envfile;
      if (Array.isArray(envFile)) {
        envFile.forEach(file => command += ` --env-file ${file}`);
      } else {
        command += ` --env-file ${envFile}`;
      }
    }
    
    // Container name
    if (params.name) {
      command += ` --name ${params.name}`;
    }
    
    // Working directory
    if (params.workdir || params.w) {
      command += ` -w "${params.workdir || params.w}"`;
    }
    
    // Network settings
    if (params.network) {
      command += ` --network ${params.network}`;
    }
    
    if (params.networkAlias) {
      if (Array.isArray(params.networkAlias)) {
        params.networkAlias.forEach((alias: string) => command += ` --network-alias ${alias}`);
      } else {
        command += ` --network-alias ${params.networkAlias}`;
      }
    }
    
    // DNS settings
    if (params.dns) {
      if (Array.isArray(params.dns)) {
        params.dns.forEach((dns: string) => command += ` --dns ${dns}`);
      } else {
        command += ` --dns ${params.dns}`;
      }
    }
    
    if (params.dnsSearch) {
      if (Array.isArray(params.dnsSearch)) {
        params.dnsSearch.forEach((search: string) => command += ` --dns-search ${search}`);
      } else {
        command += ` --dns-search ${params.dnsSearch}`;
      }
    }
    
    if (params.hostname) {
      command += ` --hostname ${params.hostname}`;
    }
    
    // Restart policy
    if (params.restart) {
      command += ` --restart ${params.restart}`;
    }
    
    // Resource limits
    if (params.memory || params.m) {
      command += ` -m ${params.memory || params.m}`;
    }
    
    if (params.memorySwap) {
      command += ` --memory-swap ${params.memorySwap}`;
    }
    
    if (params.memoryReservation) {
      command += ` --memory-reservation ${params.memoryReservation}`;
    }
    
    if (params.oomKillDisable) {
      command += ' --oom-kill-disable';
    }
    
    if (params.cpus) {
      command += ` --cpus ${params.cpus}`;
    }
    
    if (params.cpuShares) {
      command += ` --cpu-shares ${params.cpuShares}`;
    }
    
    if (params.cpuPeriod) {
      command += ` --cpu-period ${params.cpuPeriod}`;
    }
    
    if (params.cpuQuota) {
      command += ` --cpu-quota ${params.cpuQuota}`;
    }
    
    if (params.cpusetCpus) {
      command += ` --cpuset-cpus ${params.cpusetCpus}`;
    }
    
    if (params.cpusetMems) {
      command += ` --cpuset-mems ${params.cpusetMems}`;
    }
    
    if (params.pidsLimit) {
      command += ` --pids-limit ${params.pidsLimit}`;
    }
    
    // User and group settings
    if (params.user || params.u) {
      command += ` -u ${params.user || params.u}`;
    }
    
    if (params.groupAdd) {
      if (Array.isArray(params.groupAdd)) {
        params.groupAdd.forEach((group: string) => command += ` --group-add ${group}`);
      } else {
        command += ` --group-add ${params.groupAdd}`;
      }
    }
    
    // Security options
    if (params.privileged) {
      command += ' --privileged';
    }
    
    if (params.readOnly) {
      command += ' --read-only';
    }
    
    if (params.capAdd) {
      if (Array.isArray(params.capAdd)) {
        params.capAdd.forEach((cap: string) => command += ` --cap-add ${cap}`);
      } else {
        command += ` --cap-add ${params.capAdd}`;
      }
    }
    
    if (params.capDrop) {
      if (Array.isArray(params.capDrop)) {
        params.capDrop.forEach((cap: string) => command += ` --cap-drop ${cap}`);
      } else {
        command += ` --cap-drop ${params.capDrop}`;
      }
    }
    
    if (params.securityOpt) {
      if (Array.isArray(params.securityOpt)) {
        params.securityOpt.forEach((opt: string) => command += ` --security-opt ${opt}`);
      } else {
        command += ` --security-opt ${params.securityOpt}`;
      }
    }
    
    // Logging options
    if (params.logDriver) {
      command += ` --log-driver ${params.logDriver}`;
    }
    
    if (params.logOpt) {
      if (Array.isArray(params.logOpt)) {
        params.logOpt.forEach((opt: string) => command += ` --log-opt ${opt}`);
      } else {
        command += ` --log-opt ${params.logOpt}`;
      }
    }
    
    // Labels
    if (params.label) {
      if (Array.isArray(params.label)) {
        params.label.forEach((label: string) => command += ` --label ${label}`);
      } else {
        command += ` --label ${params.label}`;
      }
    }
    
    if (params.labelFile) {
      if (Array.isArray(params.labelFile)) {
        params.labelFile.forEach((file: string) => command += ` --label-file ${file}`);
      } else {
        command += ` --label-file ${params.labelFile}`;
      }
    }
    
    // Platform
    if (params.platform) {
      command += ` --platform ${params.platform}`;
    }
    
    // Entrypoint
    if (params.entrypoint) {
      command += ` --entrypoint "${params.entrypoint}"`;
    }
    
    // Ulimit
    if (params.ulimit) {
      if (Array.isArray(params.ulimit)) {
        params.ulimit.forEach((limit: string) => command += ` --ulimit ${limit}`);
      } else {
        command += ` --ulimit ${params.ulimit}`;
      }
    }
    
    // Device mappings
    if (params.device) {
      if (Array.isArray(params.device)) {
        params.device.forEach((device: string) => command += ` --device ${device}`);
      } else {
        command += ` --device ${params.device}`;
      }
    }
    
    // Additional options
    if (params.cidFile) {
      command += ` --cidfile ${params.cidFile}`;
    }
    
    if (params.detachKeys) {
      command += ` --detach-keys ${params.detachKeys}`;
    }
    
    if (params.rm === false) {
      // Explicitly don't add --rm if rm is false
    }
    
    // Legacy options object support
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
    
    // Add command to run in container
    if (params.containerCommand || params.cmd) {
      command += ` ${params.containerCommand || params.cmd}`;
    }
    
    // Handle interactive mode differently
    if (params.interactive || params.it) {
      const { spawn } = await import('child_process');
      const proc = spawn('sh', ['-c', command], {
        stdio: 'inherit'
      });
      
      const exitCode: number = await new Promise((resolve) => {
        proc.on('close', (code) => resolve(code || 0));
      });
      
      if (exitCode === 0) {
        const message = `🚀 Interactive container session completed for image: ${params.imageName}`;
        return createResponse('docker-run', message, false, process.cwd(), startTime);
      } else {
        const message = `❌ Interactive container failed for image: ${params.imageName}`;
        return createResponse('docker-run', message, true, process.cwd(), startTime);
      }
    } else {
      const result = await executeDockerCommand(command);
      const containerId = result.stdout.trim();
      
      // Get container details for better user experience
      let containerDetails = '';
      try {
        const inspectResult = await executeDockerCommand(`docker inspect ${containerId} --format "{{.Name}}\t{{.Config.Image}}\t{{.NetworkSettings.Ports}}\t{{.State.Status}}"`);
        const [name, image, ports, status] = inspectResult.stdout.trim().split('\t');
        
        containerDetails = `
📋 Container Details:
   Name: ${name.replace('/', '')}
   Image: ${image}
   Status: ${status}
   ID: ${containerId}`;

        // Parse and display port mappings if any
        if (ports && ports !== 'map[]' && ports !== '{}') {
          const portInfo = ports.replace(/map\[|\]/g, '').replace(/:/g, ' → ');
          if (portInfo.trim()) {
            containerDetails += `\n   Ports: ${portInfo}`;
          }
        }
        
        // Show container IP if on custom network
        const networkResult = await executeDockerCommand(`docker inspect ${containerId} --format "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}"`);
        const ipAddress = networkResult.stdout.trim();
        if (ipAddress) {
          containerDetails += `\n   IP: ${ipAddress}`;
        }
        
      } catch (inspectError) {
        // If inspection fails, just show basic info
        containerDetails = `\n📋 Container ID: ${containerId}`;
      }
      
      const message = `🚀 Successfully started container from image: ${params.imageName}${containerDetails}

💡 Tips:
   • View logs: dlogs ${containerId.substring(0, 12)}
   • Execute commands: dexec -it ${containerId.substring(0, 12)} /bin/sh
   • Stop container: docker stop ${containerId.substring(0, 12)}`;
      
      return createResponse('docker-run', message, false, process.cwd(), startTime);
    }
    
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

    let command = 'docker build';
    
    // Dockerfile path
    if (params.dockerfilePath || params.file || params.f) {
      const dockerfile = params.dockerfilePath || params.file || params.f;
      command += ` -f "${dockerfile}"`;
    }
    
    // Tags
    if (params.tag || params.t) {
      const tags = params.tag || params.t;
      if (Array.isArray(tags)) {
        tags.forEach(tag => command += ` -t "${tag}"`);
      } else {
        command += ` -t "${tags}"`;
      }
    }
    
    // Build arguments
    if (params.buildArg) {
      if (Array.isArray(params.buildArg)) {
        params.buildArg.forEach((arg: string) => command += ` --build-arg ${arg}`);
      } else {
        command += ` --build-arg ${params.buildArg}`;
      }
    }
    
    // Cache options
    if (params.noCache) {
      command += ' --no-cache';
    }
    
    if (params.pull) {
      command += ' --pull';
    }
    
    if (params.cacheFrom) {
      if (Array.isArray(params.cacheFrom)) {
        params.cacheFrom.forEach((cache: string) => command += ` --cache-from ${cache}`);
      } else {
        command += ` --cache-from ${params.cacheFrom}`;
      }
    }
    
    // Container removal options
    if (params.rm !== false) {
      command += ' --rm'; // Default behavior
    }
    
    if (params.forceRm) {
      command += ' --force-rm';
    }
    
    // Memory and CPU limits
    if (params.memory || params.m) {
      command += ` -m ${params.memory || params.m}`;
    }
    
    if (params.cpuShares) {
      command += ` --cpu-shares ${params.cpuShares}`;
    }
    
    if (params.cpuPeriod) {
      command += ` --cpu-period ${params.cpuPeriod}`;
    }
    
    if (params.cpuQuota) {
      command += ` --cpu-quota ${params.cpuQuota}`;
    }
    
    if (params.cpusetCpus) {
      command += ` --cpuset-cpus ${params.cpusetCpus}`;
    }
    
    if (params.cpusetMems) {
      command += ` --cpuset-mems ${params.cpusetMems}`;
    }
    
    // Network mode during build
    if (params.network) {
      command += ` --network ${params.network}`;
    }
    
    // Labels
    if (params.label) {
      if (Array.isArray(params.label)) {
        params.label.forEach((label: string) => command += ` --label ${label}`);
      } else {
        command += ` --label ${params.label}`;
      }
    }
    
    // Target stage for multi-stage builds
    if (params.target) {
      command += ` --target ${params.target}`;
    }
    
    // Platform
    if (params.platform) {
      command += ` --platform ${params.platform}`;
    }
    
    // Progress output
    if (params.progress) {
      command += ` --progress ${params.progress}`;
    }
    
    // Quiet mode
    if (params.quiet || params.q) {
      command += ' -q';
    }
    
    // Security options
    if (params.securityOpt) {
      if (Array.isArray(params.securityOpt)) {
        params.securityOpt.forEach((opt: string) => command += ` --security-opt ${opt}`);
      } else {
        command += ` --security-opt ${params.securityOpt}`;
      }
    }
    
    // Squash layers
    if (params.squash) {
      command += ' --squash';
    }
    
    // SSH agent
    if (params.ssh) {
      if (Array.isArray(params.ssh)) {
        params.ssh.forEach((ssh: string) => command += ` --ssh ${ssh}`);
      } else {
        command += ` --ssh ${params.ssh}`;
      }
    }
    
    // Build secrets
    if (params.secret) {
      if (Array.isArray(params.secret)) {
        params.secret.forEach((secret: string) => command += ` --secret ${secret}`);
      } else {
        command += ` --secret ${params.secret}`;
      }
    }
    
    // Add-hosts
    if (params.addHost) {
      if (Array.isArray(params.addHost)) {
        params.addHost.forEach((host: string) => command += ` --add-host ${host}`);
      } else {
        command += ` --add-host ${params.addHost}`;
      }
    }
    
    // Ulimit
    if (params.ulimit) {
      if (Array.isArray(params.ulimit)) {
        params.ulimit.forEach((limit: string) => command += ` --ulimit ${limit}`);
      } else {
        command += ` --ulimit ${params.ulimit}`;
      }
    }
    
    // Shm size
    if (params.shmSize) {
      command += ` --shm-size ${params.shmSize}`;
    }
    
    // Iidfile
    if (params.iidfile) {
      command += ` --iidfile ${params.iidfile}`;
    }
    
    // Isolation
    if (params.isolation) {
      command += ` --isolation ${params.isolation}`;
    }
    
    // Add context path at the end
    command += ` "${params.contextPath}"`;
    
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

export interface DockerLogoutParams {
  registry?: string;
}

/**
 * Simplified Docker login that only asks for username and runs login in background
 * Password is requested securely by Docker's own login process
 * @param params - Parameters including registry URL and username
 * @returns DockerOperationResult with login status
 */
export async function dockerLogin(params: DockerLoginParams = {}): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-login', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    const { registry = 'docker.io', username, token } = params;
    
    // If no username provided, show current login status
    if (!username && !token) {
      const whoamiResult = await executeDockerCommand('docker system info --format "{{.Username}}"').catch(() => null);
      
      let statusMessage = `🔐 Docker Registry Login Status\n`;
      statusMessage += `${'═'.repeat(50)}\n\n`;
      statusMessage += `Registry: ${registry === 'docker.io' ? 'Docker Hub (docker.io)' : registry}\n`;
      
      if (whoamiResult?.stdout?.trim()) {
        statusMessage += `Current User: ${whoamiResult.stdout.trim()}\n`;
        statusMessage += `Status: ✅ Already logged in\n\n`;
        statusMessage += `💡 To login with different user:\n`;
        statusMessage += `   dlogin --username <your-username>\n`;
        statusMessage += `   dlogin --registry ghcr.io --username <your-username>\n`;
      } else {
        statusMessage += `Status: ❌ Not logged in\n\n`;
        statusMessage += `💡 To login, provide your username:\n`;
        statusMessage += `   dlogin --username <your-username>\n`;
        statusMessage += `   dlogin --registry ghcr.io --username <your-username>\n\n`;
        statusMessage += `🔒 Docker will prompt for your password securely.\n`;
      }
      
      return createResponse('docker-login', statusMessage, false, process.cwd(), startTime);
    }

    // Handle token authentication (for GitHub Container Registry, etc.)
    if (token) {
      const { spawn } = await import('child_process');
      let command = ['login'];
      
      // Add registry if not default Docker Hub
      if (registry && registry !== 'docker.io') {
        command.push(registry);
      }
      
      command.push('--username', 'token', '--password-stdin');
      
      const proc = spawn('docker', command, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      proc.stdin.write(token);
      proc.stdin.end();
      
      const result: { stdout: string; stderr: string; code: number } = await new Promise((resolve) => {
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (data) => stdout += data.toString());
        proc.stderr.on('data', (data) => stderr += data.toString());
        proc.on('close', (code) => {
          resolve({ stdout, stderr, code: code || 0 });
        });
      });
      
      if (result.code === 0) {
        const message = `🔐 ✅ Successfully logged in to ${registry === 'docker.io' ? 'Docker Hub' : registry} using token authentication\n\n${result.stdout.trim()}`;
        return createResponse('docker-login', message, false, process.cwd(), startTime);
      } else {
        const message = `❌ Failed to login to ${registry === 'docker.io' ? 'Docker Hub' : registry} using token authentication\n${result.stderr.trim()}`;
        return createResponse('docker-login', message, true, process.cwd(), startTime);
      }
    }
    
    // Handle username authentication - simplified to only need username
    if (username) {
      const { spawn } = await import('child_process');
      let command = ['login'];
      
      // Add registry if not default Docker Hub
      if (registry && registry !== 'docker.io') {
        command.push(registry);
      }
      
      command.push('--username', username);
      
      // Run docker login with inherited stdio so user can enter password
      const proc = spawn('docker', command, {
        stdio: 'inherit'
      });
      
      const exitCode: number = await new Promise((resolve) => {
        proc.on('close', (code) => resolve(code || 0));
      });
      
      if (exitCode === 0) {
        const message = `🔐 ✅ Successfully logged in to ${registry === 'docker.io' ? 'Docker Hub' : registry} as ${username}\n\n🎉 You can now push and pull private images!`;
        return createResponse('docker-login', message, false, process.cwd(), startTime);
      } else {
        const message = `❌ Failed to login to ${registry === 'docker.io' ? 'Docker Hub' : registry} as ${username}\n\n💡 Please check your username and password.`;
        return createResponse('docker-login', message, true, process.cwd(), startTime);
      }
    }
    
    return createResponse('docker-login', 'Error: Please provide either username or token for authentication.\n\n💡 Usage: dlogin --username <your-username>', true, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-login', `❌ Login error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Docker logout from registry
 * @param params - Parameters including registry URL
 * @returns DockerOperationResult with logout status
 */
export async function dockerLogout(params: DockerLogoutParams = {}): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-logout', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    const { registry = 'docker.io' } = params;
    
    let command = 'docker logout';
    
    // Add registry if not default Docker Hub
    if (registry && registry !== 'docker.io') {
      command += ` ${registry}`;
    }
    
    const result = await executeDockerCommand(command);
    
    if (result.stdout || result.stderr) {
      const message = `🔐 Successfully logged out from ${registry === 'docker.io' ? 'Docker Hub' : registry}\n\n${(result.stdout + result.stderr).trim()}\n\n💡 You'll need to login again to access private repositories.`;
      return createResponse('docker-logout', message, false, process.cwd(), startTime);
    } else {
      const message = `🔐 ✅ Successfully logged out from ${registry === 'docker.io' ? 'Docker Hub' : registry}\n\n💡 You'll need to login again to access private repositories.`;
      return createResponse('docker-logout', message, false, process.cwd(), startTime);
    }
    
  } catch (error: any) {
    return createResponse('docker-logout', `❌ Logout error: ${error.message}`, true, process.cwd(), startTime);
  }
}

/**
 * Manages Docker bridge networks and connections
 * @param params - Parameters including action and bridge details
 * @returns DockerOperationResult with bridge operation status
 */
export async function dockerBridge(params: any): Promise<DockerOperationResult> {
  const startTime = Date.now();
  
  try {
    if (!(await isDockerRunning())) {
      return createResponse('docker-bridge', 'Error: Docker daemon is not running. Please start Docker first.', true, process.cwd(), startTime);
    }

    let command = '';
    let resultText = '';

    switch (params?.action) {
      case 'list':
      case 'ls':
        command = "docker network ls --filter driver=bridge --format 'table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}'";
        break;
      case 'inspect':
        if (!params.bridgeName) {
          return createResponse('docker-bridge', 'Error: Bridge name is required for inspect action.', true, process.cwd(), startTime);
        }
        command = `docker network inspect ${params.bridgeName}`;
        break;
      case 'create':
        if (!params.bridgeName) {
          return createResponse('docker-bridge', 'Error: Bridge name is required for create action.', true, process.cwd(), startTime);
        }
        command = `docker network create --driver bridge`;
        if (params.subnet) {
          command += ` --subnet=${params.subnet}`;
        }
        if (params.gateway) {
          command += ` --gateway=${params.gateway}`;
        }
        if (params.ipRange) {
          command += ` --ip-range=${params.ipRange}`;
        }
        command += ` ${params.bridgeName}`;
        break;
      case 'remove':
      case 'rm':
        if (!params.bridgeName) {
          return createResponse('docker-bridge', 'Error: Bridge name is required for remove action.', true, process.cwd(), startTime);
        }
        command = `docker network rm ${params.bridgeName}`;
        break;
      case 'connect':
        if (!params.bridgeName || !params.containerName) {
          return createResponse('docker-bridge', 'Error: Bridge name and container name are required for connect action.', true, process.cwd(), startTime);
        }
        command = `docker network connect ${params.bridgeName} ${params.containerName}`;
        if (params.ip) {
          command += ` --ip ${params.ip}`;
        }
        break;
      case 'disconnect':
        if (!params.bridgeName || !params.containerName) {
          return createResponse('docker-bridge', 'Error: Bridge name and container name are required for disconnect action.', true, process.cwd(), startTime);
        }
        command = `docker network disconnect ${params.bridgeName} ${params.containerName}`;
        break;
      case 'prune':
        command = 'docker network prune --filter driver=bridge -f';
        break;
      default:
        return createResponse('docker-bridge', 'Error: Invalid action. Use: list, inspect, create, remove, connect, disconnect, or prune.', true, process.cwd(), startTime);
    }

    const result = await executeDockerCommand(command);
    
    switch (params.action) {
      case 'list':
      case 'ls':
        resultText = `🌉 Docker Bridge Networks:\n\n${result.stdout}`;
        break;
      case 'inspect':
        resultText = `🔍 Bridge network details for ${params.bridgeName}:\n\n${result.stdout}`;
        break;
      case 'create':
        resultText = `✅ Successfully created bridge network: ${params.bridgeName}\n\n${result.stdout}`;
        break;
      case 'remove':
      case 'rm':
        resultText = `🗑️ Successfully removed bridge network: ${params.bridgeName}`;
        break;
      case 'connect':
        resultText = `🔗 Successfully connected container ${params.containerName} to bridge ${params.bridgeName}`;
        break;
      case 'disconnect':
        resultText = `🔌 Successfully disconnected container ${params.containerName} from bridge ${params.bridgeName}`;
        break;
      case 'prune':
        resultText = `🧹 Successfully pruned unused bridge networks\n\n${result.stdout}`;
        break;
    }
    
    return createResponse('docker-bridge', resultText, false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-bridge', `Error: ${error.message}`, true, process.cwd(), startTime);
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

╔═══════════════════════════════════════════════════════════════════════════╗
║                        📦 QUICK INSTALLATION                             ║
╚═══════════════════════════════════════════════════════════════════════════╝

� Install globally to use all aliases anywhere:
   npm install -g .

🔧 Or run the install script:
   npm run install:global

💡 After global installation, all aliases below work from any directory!

╔═══════════════════════════════════════════════════════════════════════════╗
║                          �📦 BASIC OPERATIONS                             ║
║                            (bin/basic/)                                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

┏━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔧 Alias   ┃ 📝 Description                                             ┃
┣━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ dimages    ┃ 📋 List all Docker images with size and tags              ┃
┃ dps        ┃ 🟢 List running containers                                 ┃
┃ dpsa       ┃ 📊 List all containers (including stopped)                ┃
┃ dpull      ┃ ⬇️  Pull Docker images from registry                       ┃
┃ drun       ┃ 🚀 Run Docker containers with options                     ┃
┃ dlogs      ┃ 📄 View container logs (with follow support)              ┃
┃ dexec      ┃ 💻 Execute commands in running containers                  ┃
┃ dbuild     ┃ 🔨 Build Docker images from Dockerfile                    ┃
┗━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

╔═══════════════════════════════════════════════════════════════════════════╗
║                         🔧 ADVANCED OPERATIONS                           ║
║                           (bin/advanced/)                                 ║
╚═══════════════════════════════════════════════════════════════════════════╝

┏━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔧 Alias   ┃ 📝 Description                                             ┃
┣━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ dcompose   ┃ 🐙 Docker Compose operations (up/down/build)               ┃
┃ dup        ┃ ⬆️  Start services with docker-compose up                  ┃
┃ ddown      ┃ ⬇️  Stop services with docker-compose down                 ┃
┃ dnetwork   ┃ 🌐 Manage Docker networks (create/list/remove)             ┃
┃ dvolume    ┃ 💾 Manage Docker volumes (create/list/remove)              ┃
┃ dinspect   ┃ 🔍 Inspect Docker resources in detail                      ┃
┃ dprune     ┃ 🧹 Clean up unused Docker resources                        ┃
┃ dlogin     ┃ 🔐 Login to Docker registries (simplified)                ┃
┃ dlogout    ┃ 🚪 Logout from Docker registries                          ┃
┃ dbridge    ┃ 🌉 Manage Docker bridge networks                          ┃
┃ ddev       ┃ 👨‍💻 Development container workflows                        ┃
┃ dclean     ┃ 🧽 Comprehensive Docker system cleanup                     ┃
┃ dstop      ┃ ⏹️  Stop containers and services                           ┃
┃ dreset     ┃ 🔄 Reset Docker environment                                ┃
┗━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

╔═══════════════════════════════════════════════════════════════════════════╗
║                          🚀 MAIN CLI COMMANDS                            ║
╚═══════════════════════════════════════════════════════════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔧 Command          ┃ 📝 Description                                      ┃
┣━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ docker-mcp-server   ┃ 🎛️  Main CLI with all tools                        ┃
┃ dms                 ┃ ⚡ Short alias for docker-mcp-server               ┃
┃ dlist               ┃ 📋 Show this help (list all tools)                 ┃
┗━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

╔═══════════════════════════════════════════════════════════════════════════╗
║                          📖 USAGE EXAMPLES                               ║
╚═══════════════════════════════════════════════════════════════════════════╝

💡 Basic Operations:
   dimages                    # List all images
   dps                        # List running containers
   dpsa                       # List all containers
   dpull nginx:latest         # Pull specific image
   drun -p 8080:80 nginx      # Run container with port mapping
   dlogs mycontainer --follow # Follow container logs
   dexec mycontainer bash     # Open bash in container
   dbuild -t myapp .          # Build image from current directory

🔧 Advanced Operations:
   dup                        # Start compose services
   ddown                      # Stop compose services
   dnetwork create mynet      # Create custom network
   dvolume create myvol       # Create named volume
   dinspect container myapp   # Inspect container details
   dclean all                 # Clean unused resources
   dprune images              # Remove unused images

🔐 Registry Operations:
   dlogin --username myuser   # Login to Docker Hub (password prompted)
   dlogout                    # Logout from Docker Hub
   dlogin --registry ghcr.io --username myuser  # Login to GitHub registry

🌉 Bridge Network Operations:
   dbridge list               # List all bridge networks
   dbridge create mybridge    # Create custom bridge network
   dbridge connect mybridge mycontainer  # Connect container to bridge
   dbridge disconnect mybridge mycontainer  # Disconnect from bridge

╔═══════════════════════════════════════════════════════════════════════════╗
║                      🔗 MCP TOOLS (Via MCP Protocol)                     ║
╚═══════════════════════════════════════════════════════════════════════════╝

Available in Claude Desktop and other MCP clients:
• docker-images    • docker-containers  • docker-pull      • docker-run
• docker-logs      • docker-build       • docker-exec      • docker-compose
• docker-networks  • docker-volumes     • docker-inspect   • docker-prune
• docker-login     • docker-logout      • docker-bridge    • docker-list      

╔═══════════════════════════════════════════════════════════════════════════╗
║                             💡 PRO TIPS                                  ║
╚═══════════════════════════════════════════════════════════════════════════╝

🎯 Quick Setup:
   1. npm install -g .                # Install globally
   2. dlist                           # Verify installation
   3. dimages                         # Test basic functionality

🚀 Development Workflow:
   1. dbuild -t myapp .               # Build your application
   2. drun -p 3000:3000 myapp         # Run with port mapping
   3. dlogs myapp                     # Check application logs
   4. dexec myapp bash                # Debug inside container

🧹 Maintenance:
   1. dprune containers               # Remove stopped containers
   2. dprune images                   # Remove unused images
   3. dclean deep                     # Deep system cleanup

📖 Documentation:
   • All commands support --help flag for detailed usage
   • Use 'docker-mcp-server help' for interactive help
   • Check server status: docker-mcp-server status

� Global Access:
   After running 'npm install -g .' all aliases work system-wide!
   No need for 'npx' or project-specific installation.

📚 More Info: https://github.com/0xshariq/docker-mcp-server
`;

    return createResponse('docker-list', listMessage.trim(), false, process.cwd(), startTime);
    
  } catch (error: any) {
    return createResponse('docker-list', `Error listing tools: ${error.message}`, true, process.cwd(), startTime);
  }
}