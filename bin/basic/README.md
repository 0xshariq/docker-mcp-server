# Basic Docker Operations - CLI Aliases

This directory contains 8 essential Docker operation aliases that provide simplified access to the most commonly used Docker commands. Each alias is a standalone executable script with comprehensive help documentation and error handling.

## Overview

Basic operations cover fundamental Docker tasks that every developer needs on a daily basis. These commands are designed to be simple, safe, and intuitive while providing access to the most important Docker functionality.

**All 11 Basic Commands:**
- `dimages` - List and filter Docker images
- `dps` - List running containers  
- `dpsa` - List all containers (including stopped)
- `dpull` - Pull images from registries
- `drun` - Run containers with full option support
- `dlogs` - View and follow container logs
- `dexec` - Execute commands inside containers
- `dbuild` - Build images from Dockerfiles
- `dprune` - Clean up unused Docker objects
- `dup` - Quick Docker Compose up (start services)
- `ddown` - Quick Docker Compose down (stop services)

**💡 Pro Tip:** Every command supports `--help` or `-h` for detailed usage information!

## Command Details

### 📋 `dimages` - List Docker Images

**Purpose:** List all Docker images on your system with detailed information including repository, tag, image ID, creation date, and size.

**Command:** `dimages [filter] [options]`

**Parameters:**
- `[filter]` - Optional filter pattern to match image names (e.g., `dimages nginx`)

**Essential Options:**
- `-a, --all` - Show all images (including intermediate layers)
- `-q, --quiet` - Only show image IDs (useful for scripting)
- `--filter <key=value>` - Advanced filtering (dangling=true, before=<image>, etc.)
- `--format <template>` - Format output using Go templates
- `--digests` - Show image digests for content verification
- `--no-trunc` - Don't truncate output (show full IDs and names)
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic usage
dimages                                  # List all images
dimages --help                          # Show help

# Filtering
dimages nginx                           # Images containing 'nginx'
dimages --filter "dangling=true"       # Untagged images
dimages --filter "before=myapp:v1.0"   # Images created before myapp:v1.0

# Output formatting
dimages -q                              # Only IDs (for scripts)
dimages --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
dimages --no-trunc                      # Full image information

# Cleanup helpers
dimages --filter "dangling=true" -q     # Get IDs of dangling images
```

**Output Information:**
- **REPOSITORY** - Image name/repository
- **TAG** - Version tag (latest, v1.0, etc.)
- **IMAGE ID** - Unique identifier (first 12 characters)
- **CREATED** - When the image was created
- **SIZE** - Total size of all layers

**Practical Examples:**
```bash
# Development workflow
dimages node                            # Find Node.js images
dimages --filter "label=version=dev"    # Development images only
dimages --format "{{.Repository}}:{{.Tag}}" | grep myapp

# System maintenance
dimages --filter "dangling=true"        # Find cleanup candidates
dimages --all | wc -l                   # Count total images
```

**Related Commands:** `dpull`, `dbuild`, `drun`
**MCP Tool:** `docker-images`

---

### 🟢 `dps` - List Running Containers

**Purpose:** Display all currently running Docker containers with their status, ports, names, and resource usage.

**Command:** `dps [options]`

**Parameters:** None required - shows running containers by default

**Essential Options:**
- `-a, --all` - Show all containers (running + stopped + paused)
- `-q, --quiet` - Only show container IDs (perfect for scripting)
- `-s, --size` - Display total file sizes (includes writable layer)
- `-l, --latest` - Show only the latest created container
- `-n, --last <number>` - Show the last n created containers
- `--filter <key=value>` - Filter containers by various criteria
- `--format <template>` - Custom output formatting with Go templates
- `--no-trunc` - Don't truncate output (show full container IDs)
- `-h, --help` - Show detailed help information

**Filtering Options:**
```bash
# By status
dps --filter "status=running"          # Only running containers
dps --filter "status=exited"           # Only stopped containers

# By name/label
dps --filter "name=web"                # Containers with 'web' in name
dps --filter "label=environment=prod"  # Production containers

# By image
dps --filter "ancestor=nginx"          # Containers from nginx image

# By resource
dps --filter "expose=80"               # Containers exposing port 80
```

**Common Use Cases:**
```bash
# Basic monitoring
dps                                     # Show running containers
dps --help                             # Show help

# System overview
dps -a                                 # All containers (running + stopped)
dps -s                                 # Include size information
dps --latest                           # Most recently created

# Scripting and automation
dps -q                                 # Only container IDs
dps -q --filter "status=exited"       # IDs of stopped containers
dps --format "{{.Names}}"              # Only container names

# Detailed monitoring
dps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.RunningFor}}"
dps --no-trunc                         # Full container information
```

**Output Information:**
- **CONTAINER ID** - Unique identifier (first 12 characters)
- **IMAGE** - Source image name and tag
- **COMMAND** - Command being executed
- **CREATED** - When container was created
- **STATUS** - Current status (Up 2 hours, Exited (0) 5 minutes ago)
- **PORTS** - Published ports (0.0.0.0:8080->80/tcp)
- **NAMES** - Container name(s)
- **SIZE** - Total file size (if -s flag used)

**Practical Examples:**
```bash
# Development workflow
dps                                     # Quick status check
dps --filter "name=dev"                # Development containers
dps --format "{{.Names}}: {{.Status}}" # Simple status overview

# Production monitoring
dps --filter "label=env=production"    # Production containers only
dps -s --filter "status=running"       # Running containers with sizes

# Debugging and cleanup
dps -a --filter "status=exited"        # Find stopped containers
dps -q --filter "status=created"       # Containers that never started
```

**Related Commands:** `dpsa` (all containers), `dlogs` (container logs), `dexec` (run commands)
**MCP Tool:** `docker-containers`

---

### 📊 `dpsa` - List All Containers

**Purpose:** Display all Docker containers on your system, including running, stopped, paused, and created containers.

**Command:** `dpsa [options]`

**Parameters:** None required - shows all containers by default

**Essential Options:**
- `-q, --quiet` - Only show container IDs (perfect for cleanup scripts)
- `-s, --size` - Display total file sizes including writable layer size
- `-l, --latest` - Show only the most recently created container
- `-n, --last <number>` - Show the last n created containers
- `--filter <key=value>` - Filter containers by various criteria
- `--format <template>` - Custom output formatting with Go templates
- `--no-trunc` - Don't truncate output (show full container IDs)
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic usage
dpsa                                    # Show all containers
dpsa --help                            # Show help

# Container management
dpsa -q                                # Only container IDs (for scripts)
dpsa -s                                # Include size information
dpsa --latest                          # Most recent container

# Filtering for cleanup
dpsa --filter "status=exited"          # Stopped containers
dpsa --filter "status=created"         # Containers that never started  
dpsa --filter "status=dead"            # Dead containers

# Advanced filtering
dpsa --filter "name=test"              # Containers with 'test' in name
dpsa --filter "since=container_name"   # Created after specific container
dpsa --filter "before=container_name"  # Created before specific container

# Output formatting
dpsa --format "{{.Names}}: {{.Status}}"                    # Simple status
dpsa --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"  # Custom table
dpsa --no-trunc                        # Full container information
```

**Practical Examples:**
```bash
# System cleanup preparation
dpsa --filter "status=exited" -q       # Get IDs of stopped containers
dpsa --filter "status=created" -q      # Containers that never started
dpsa --filter "status=dead" -q         # Dead containers for cleanup

# Development workflow
dpsa --filter "name=dev"               # Development containers
dpsa --latest --format "{{.Names}}: {{.Status}}" # Check recent container

# Monitoring and analysis
dpsa -s --filter "status=running"      # Running containers with sizes
dpsa --format "{{.Names}}\t{{.RunningFor}}\t{{.Status}}" # Runtime overview
```

**Status Types Explained:**
- **running** - Container is currently running
- **exited** - Container stopped (may have run successfully or failed)
- **created** - Container created but never started
- **restarting** - Container is restarting
- **removing** - Container is being removed
- **paused** - Container is paused
- **dead** - Container failed to start or run

**Difference from `dps`:**
- `dps` - Shows only **running** containers by default
- `dpsa` - Shows **all** containers (running + stopped + created + paused)

**Related Commands:** `dps` (running only), `dstop` (stop containers), `dlogs` (view logs)
**MCP Tool:** `docker-containers` (with all=true parameter)

---

### ⬇️ `dpull` - Pull Docker Images

**Purpose:** Download Docker images from registries (Docker Hub, AWS ECR, GitHub Container Registry, etc.) to your local system.

**Command:** `dpull <image>[:<tag>] [options]`

**Parameters:**
- `<image>` - Required. Image name to pull (e.g., nginx, ubuntu, node)
- `[:<tag>]` - Optional. Specific version tag (default: latest)

**Essential Options:**
- `-a, --all-tags` - Pull all tagged versions of the repository
- `--platform <platform>` - Pull image for specific platform (linux/amd64, linux/arm64, etc.)
- `--disable-content-trust` - Skip image signature verification (default: true)
- `-q, --quiet` - Suppress verbose output during pull
- `--pull-timeout <seconds>` - Set timeout for pull operations
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic image pulling
dpull nginx                             # Pull nginx:latest
dpull --help                           # Show help

# Specific versions
dpull nginx:alpine                      # Pull Alpine-based nginx
dpull ubuntu:20.04                     # Pull Ubuntu 20.04 LTS
dpull node:16-alpine                    # Pull Node.js 16 on Alpine

# Pull from different registries
dpull ghcr.io/user/myapp               # GitHub Container Registry
dpull gcr.io/project/app:v1.0          # Google Container Registry
dpull myregistry.azurecr.io/app        # Azure Container Registry

# Platform-specific pulls
dpull --platform linux/amd64 nginx     # Pull for x86-64
dpull --platform linux/arm64 nginx     # Pull for ARM64 (Apple Silicon)
dpull --platform linux/arm/v7 nginx    # Pull for ARM v7 (Raspberry Pi)

# Advanced options
dpull -a nginx                          # Pull all nginx tags
dpull --quiet ubuntu:20.04              # Silent pull
dpull --disable-content-trust myapp     # Skip signature verification
```

**Registry Examples:**
```bash
# Docker Hub (default registry)
dpull nginx                            # From Docker Hub
dpull library/nginx                    # Explicit library namespace
dpull username/myapp                   # User repository

# Other registries
dpull gcr.io/google-containers/nginx   # Google Container Registry
dpull ghcr.io/owner/repository         # GitHub Container Registry
dpull quay.io/repository/image         # Quay.io registry
```

**Platform Architecture Options:**
- `linux/amd64` - Standard x86-64 (Intel/AMD)
- `linux/arm64` - ARM 64-bit (Apple M1/M2, AWS Graviton)
- `linux/arm/v7` - ARM 32-bit v7 (Raspberry Pi)
- `linux/arm/v6` - ARM 32-bit v6
- `linux/386` - x86 32-bit
- `windows/amd64` - Windows containers

**Practical Examples:**
```bash
# Development environment setup
dpull node:18-alpine                   # Lightweight Node.js
dpull postgres:15                      # Latest PostgreSQL 15
dpull redis:alpine                     # Lightweight Redis

# Multi-platform development (Apple Silicon)
dpull --platform linux/amd64 mysql:8.0  # Force x86 version
dpull --platform linux/arm64 nginx       # Native ARM version

# CI/CD preparation
dpull -a myapp                         # Pull all tags for testing
dpull --quiet --platform linux/amd64 myapp:latest  # Silent production pull

# Registry authentication (if needed)
# Run first: dlogin --username youruser
dpull youruser/private-app             # Pull private image
```

**Output Information:**
The command shows:
- **Pull status** - Downloading, extracting, verifying
- **Layer information** - Image layer IDs and progress
- **Size information** - Downloaded/extracted sizes
- **Final status** - Success confirmation with image ID

**Error Handling:**
- **Image not found** - Check spelling and tag availability
- **Authentication required** - Use `dlogin` for private repositories
- **Platform not available** - Try different platform or check image support
- **Network issues** - Check internet connection and retry

**Related Commands:** `dimages` (list pulled images), `drun` (run pulled images), `dlogin` (authenticate)
**MCP Tool:** `docker-pull`

---
```bash
dpull nginx                     # Pull nginx:latest
dpull nginx:alpine              # Pull specific tag
dpull ubuntu:20.04              # Pull Ubuntu 20.04
dpull --platform linux/amd64 nginx  # Pull for specific platform
```

**MCP Tool:** `docker-pull`

---

### 🚀 `drun` - Run Docker Containers

**Command:** `drun [options] <image> [command]`

Runs a Docker container from an image with comprehensive options support.

**Interactive Options:**
- `-it` - Interactive mode with TTY (combine -i and -t)
- `-i, --interactive` - Keep STDIN open even if not attached
- `-t, --tty` - Allocate a pseudo-TTY

**Execution Options:**
- `-d, --detach` - Run container in background and print container ID
- `--rm` - Automatically remove the container when it exits
- `--restart <policy>` - Restart policy (no|on-failure|always|unless-stopped)

**Networking Options:**
- `-p, --publish <host:container>` - Publish container port to host
- `--network <network>` - Connect container to a network
- `--expose <port>` - Expose a port without publishing it

**Storage Options:**
- `-v, --volume <host:container>` - Bind mount a volume
- `--mount <mount>` - Attach a filesystem mount to the container
- `-w, --workdir <dir>` - Working directory inside the container

**Environment Options:**
- `-e, --env <key=value>` - Set environment variables
- `--env-file <file>` - Read environment variables from file

**Resource Options:**
- `-m, --memory <limit>` - Memory limit (e.g., 512m, 1g)
- `--cpus <number>` - Number of CPUs (e.g., 0.5, 1.5)
- `--memory-swap <limit>` - Swap limit equal to memory plus swap

**Security Options:**
- `-u, --user <user>` - Username or UID
- `--privileged` - Give extended privileges to this container
- `--cap-add <capability>` - Add Linux capabilities
- `--cap-drop <capability>` - Drop Linux capabilities

**Other Options:**
- `--name <name>` - Assign a name to the container
- `--hostname <hostname>` - Container host name
- `--add-host <host:ip>` - Add a custom host-to-IP mapping

**Examples:**
```bash
# Basic usage
drun nginx                                    # Run nginx in detached mode
drun -it ubuntu bash                         # Interactive Ubuntu with bash
drun -d -p 8080:80 nginx                     # Run nginx with port mapping

# With volumes and environment
drun -v /host/data:/container/data -e ENV=prod myapp
drun --mount type=bind,source=/host,target=/container myapp

# Resource limits
drun -m 512m --cpus 1.5 myapp                # Limit memory and CPU
drun --restart always --name myservice nginx  # Always restart with name

# Interactive development
drun -it -v $(pwd):/workspace -w /workspace node:16 bash
drun --rm -it -p 3000:3000 myapp              # Remove after exit
```

**MCP Tool:** `docker-run`

---

### 📄 `dlogs` - View Container Logs

**Command:** `dlogs <container> [options]`

Fetches and displays logs from a Docker container.

**Options:**
- `-f, --follow` - Follow log output (live tail)
- `--tail <lines>` - Number of lines to show from the end of logs
- `--since <timestamp>` - Show logs since timestamp
- `--until <timestamp>` - Show logs until timestamp  
- `-t, --timestamps` - Show timestamps
- `--details` - Show extra details provided to logs

**Examples:**
```bash
dlogs mycontainer               # Show all logs
dlogs -f mycontainer           # Follow logs in real-time
dlogs --tail 100 mycontainer   # Show last 100 lines
dlogs --since 2023-01-01 mycontainer  # Logs since date
```

**MCP Tool:** `docker-logs`

---

### 💻 `dexec` - Execute Commands in Containers

**Command:** `dexec [options] <container> <command>`

Executes a command inside a running Docker container.

**Options:**
- `-it` - Interactive mode with TTY allocation
- `-i, --interactive` - Keep STDIN open
- `-t, --tty` - Allocate a pseudo-TTY
- `-d, --detach` - Detached mode (run in background)
- `-u, --user <user>` - Username or UID
- `-w, --workdir <dir>` - Working directory
- `-e, --env <key=value>` - Set environment variables
- `--privileged` - Give extended privileges

**Examples:**
```bash
dexec mycontainer ls -la        # List files in container
dexec -it mycontainer bash      # Interactive bash shell
dexec -u root mycontainer whoami # Execute as root user
dexec -w /app mycontainer npm test  # Run in specific directory
```

**MCP Tool:** `docker-exec`

---

### 🔨 `dbuild` - Build Docker Images

**Command:** `dbuild [options] <context>`

Builds a Docker image from a Dockerfile and context.

**Options:**
- `-t, --tag <name:tag>` - Name and optionally tag the image
- `-f, --file <dockerfile>` - Name of Dockerfile (default: Dockerfile)
- `--build-arg <key=value>` - Set build-time variables
- `--no-cache` - Do not use cache when building the image
- `--pull` - Always attempt to pull a newer version of the image
- `--target <stage>` - Set target build stage
- `--platform <platform>` - Set platform if server is multi-platform

**Examples:**
```bash
dbuild .                        # Build from current directory
dbuild -t myapp:v1.0 .         # Build with tag
dbuild -f Dockerfile.prod .     # Use specific Dockerfile
dbuild --no-cache -t myapp .    # Build without cache
dbuild --build-arg VERSION=1.0 --tag myapp:1.0 .
```

**MCP Tool:** `docker-build`

---

## Usage Patterns

### Development Workflow
```bash
# 1. Pull base image
dpull node:16-alpine

# 2. Build your application
dbuild -t myapp:dev .

# 3. Run with development setup
drun -it -v $(pwd):/app -p 3000:3000 myapp:dev

# 4. Check logs
dlogs -f myapp_container

# 5. Debug inside container
dexec -it myapp_container sh
```

### Image Management
```bash
# List and inspect images
dimages
dimages --filter myapp

# Pull different versions
dpull myapp:v1.0
dpull myapp:latest
```

### Container Management
```bash
# List running containers
dps

# List all containers
dpsa

# Check container logs
dlogs mycontainer

# Execute commands
dexec mycontainer ps aux
```

## Tips and Best Practices

1. **Use specific tags**: Always specify image tags in production
2. **Resource limits**: Set memory and CPU limits for containers
3. **Volume mounting**: Use volumes for persistent data
4. **Environment variables**: Use `-e` or `--env-file` for configuration
5. **Interactive debugging**: Use `-it` for interactive troubleshooting
6. **Cleanup**: Use `--rm` for temporary containers
7. **Networking**: Use custom networks for container communication

## Error Handling

All aliases include comprehensive error handling:
- Docker daemon connectivity checks
- Input validation
- Meaningful error messages
- Proper exit codes
- Timeout protection

---

### 🧹 `dprune` - Docker System Cleanup

**Purpose:** Remove unused Docker objects (containers, images, networks, volumes) to reclaim disk space and maintain a clean Docker environment with flexible cleanup options.

**Command:** `dprune [type] [options]`

**Object Types:**
- `system` - Remove all unused objects (containers, images, networks) - default
- `images` - Remove unused images only
- `containers` - Remove stopped containers only  
- `volumes` - Remove unused volumes only (⚠️ DATA LOSS RISK)
- `networks` - Remove unused networks only

**Essential Options:**
- `-f, --force` - Don't prompt for confirmation
- `-a, --all` - Remove all unused images (not just dangling)
- `--volumes` - Include volumes when using system prune
- `--filter <filter>` - Apply filters (e.g., until=24h, label=env=test)
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic cleanup operations
dprune --help                   # Show comprehensive help
dprune                          # Interactive system cleanup (default)
dprune system -f                # Force system cleanup without prompts
dprune images                   # Remove dangling images only

# Specific object cleanup
dprune containers -f            # Remove all stopped containers
dprune networks                 # Remove unused networks (interactive)
dprune volumes -f               # Remove unused volumes (DANGEROUS!)

# Advanced cleanup with filters
dprune images -a                # Remove ALL unused images
dprune system --volumes -f      # Full cleanup including volumes
dprune images --filter "until=24h"  # Remove images older than 24 hours
dprune containers --filter "label=temporary=true"  # Remove containers with specific label
```

**Safety Considerations:**
- **Volume cleanup permanently deletes data** - backup important volumes first
- **Image cleanup may affect deployments** - verify no critical apps depend on removed images
- **Always test without -f flag** to see what will be removed before forcing
- **Use filters** to avoid removing important objects accidentally

**Output Information:**
- Shows object type being cleaned up
- Displays filter information when applied
- Provides success/failure status
- Warns about dangerous operations (volume cleanup)

**Related Commands:** `dimages` (list images), `dps`/`dpsa` (list containers), `docker system df` (space usage)  
**MCP Tool:** `docker-prune`

---

### 🚀 `dup` - Quick Docker Compose Up

**Purpose:** Quick alias for `docker-compose up` - Start services defined in docker-compose.yml with simplified command interface.

**Command:** `dup [options] [service...]`

**Essential Options:**
- `-d, --detach` - Run containers in background (detached mode)
- `--build` - Build images before starting containers
- `--force-recreate` - Recreate containers even if configuration hasn't changed
- `--no-deps` - Don't start linked services
- `--scale SERVICE=NUM` - Scale SERVICE to NUM instances
- `-f, --file FILE` - Specify compose file (default: docker-compose.yml)
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic service management
dup --help                      # Show comprehensive help
dup                             # Start all services (foreground)
dup -d                          # Start all services in background
dup --build                     # Build images before starting

# Specific services
dup web database                # Start only web and database services
dup -d web                      # Start web service in background
dup --scale web=3               # Start with 3 web service instances

# Advanced configurations
dup -f docker-compose.prod.yml  # Use production compose file
dup -d --build --force-recreate # Full rebuild and background start
```

**Workflow Integration:**
- Use `dup -d` for background development services
- Use `dup --build` when Dockerfile changes
- Combine with `ddown` for clean stop/start cycles
- Use `dps` to check running container status

**Related Commands:** `ddown` (stop services), `dcompose` (full compose interface), `dps` (container status)  
**MCP Tool:** `docker-compose`

---

### 🛑 `ddown` - Quick Docker Compose Down

**Purpose:** Quick alias for `docker-compose down` - Stop and remove containers, networks, and optionally volumes and images.

**Command:** `ddown [options]`

**Essential Options:**
- `-v, --volumes` - Remove named volumes declared in 'volumes' section (⚠️ DATA LOSS)
- `--rmi TYPE` - Remove images (all|local)
- `--remove-orphans` - Remove containers for services not in Compose file
- `-f, --file FILE` - Specify compose file (default: docker-compose.yml)
- `-t, --timeout TIMEOUT` - Shutdown timeout in seconds (default: 10)
- `-h, --help` - Show detailed help information

**Common Use Cases:**
```bash
# Basic service shutdown
ddown --help                    # Show comprehensive help
ddown                           # Stop and remove containers
ddown --remove-orphans          # Remove orphaned containers too
ddown -t 30                     # Use 30-second shutdown timeout

# Cleanup operations (DANGEROUS)
ddown -v                        # Stop services and remove volumes
ddown --rmi all                 # Stop services and remove all images
ddown --rmi local               # Stop services and remove local images
ddown -v --rmi local            # Full cleanup - volumes and local images

# Production usage
ddown -f docker-compose.prod.yml # Use production compose file
```

**Safety Warnings:**
- **`-v` flag removes volumes permanently** - backup important data first
- **`--rmi` removes images** - may affect other containers using same images
- **Always verify** what will be removed before using destructive flags

**Workflow Integration:**
- Use `ddown` for clean development environment shutdown
- Use `dup` after `ddown` for clean restart cycles
- Combine with `dprune` for comprehensive cleanup

**Related Commands:** `dup` (start services), `dcompose` (full compose interface), `dprune` (system cleanup)  
**MCP Tool:** `docker-compose`

---

## Related Documentation

- [Advanced Operations](../advanced/README.md)
- [Command Reference](../../docs/commands.md)
- [Installation Guide](../../docs/installation-guide.md)
