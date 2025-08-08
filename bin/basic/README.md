# Basic Docker Operations - CLI Aliases

This directory contains basic Docker operation aliases that provide simplified access to essential Docker commands.

## Overview

The basic operations cover fundamental Docker tasks that every developer needs on a daily basis. Each alias is a standalone executable script that forwards commands to the main Docker MCP CLI with proper argument handling.

## Available Aliases

### 📋 `dimages` - List Docker Images

**Command:** `dimages [options]`

Lists all Docker images on your system with detailed information including repository, tag, image ID, creation time, and size.

**Options:**
- `--filter <pattern>` - Filter images by name pattern
- `--format <format>` - Format output using Go templates
- `-q, --quiet` - Only show image IDs
- `--all` - Show all images (including intermediate layers)
- `--digests` - Show image digests
- `--no-trunc` - Don't truncate output

**Examples:**
```bash
dimages                          # List all images
dimages --filter nginx           # Show only nginx images
dimages -q                       # Show only image IDs
dimages --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

**MCP Tool:** `docker-images`

---

### 🟢 `dps` - List Running Containers

**Command:** `dps [options]`

Lists all currently running Docker containers with their status, ports, and names.

**Options:**
- `-a, --all` - Show all containers (running and stopped)
- `-q, --quiet` - Only show container IDs
- `--filter <filter>` - Filter containers (e.g., name=myapp)
- `--format <format>` - Format output using Go templates
- `--last <n>` - Show n last created containers
- `--size` - Display total file sizes

**Examples:**
```bash
dps                              # List running containers
dps -q                          # Show only container IDs
dps --filter "name=nginx"       # Show containers with name containing 'nginx'
dps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**MCP Tool:** `docker-containers`

---

### 📊 `dpsa` - List All Containers

**Command:** `dpsa [options]`

Lists all Docker containers including both running and stopped ones.

**Options:**
- `-q, --quiet` - Only show container IDs
- `--filter <filter>` - Filter containers
- `--format <format>` - Format output using Go templates
- `--last <n>` - Show n last created containers
- `--size` - Display total file sizes

**Examples:**
```bash
dpsa                            # List all containers
dpsa -q                         # Show only container IDs
dpsa --filter "status=exited"   # Show only stopped containers
```

**MCP Tool:** `docker-containers` (with all=true parameter)

---

### ⬇️ `dpull` - Pull Docker Images

**Command:** `dpull <image>[:<tag>] [options]`

Pulls a Docker image from a registry (Docker Hub by default).

**Options:**
- `-a, --all-tags` - Pull all tagged images in the repository
- `--disable-content-trust` - Skip image verification (default true)
- `--platform <platform>` - Set platform if server is multi-platform capable
- `-q, --quiet` - Suppress verbose output

**Examples:**
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

## Related Documentation

- [Advanced Operations](../advanced/README.md)
- [Command Reference](../../docs/commands.md)
- [Installation Guide](../../docs/installation-guide.md)
