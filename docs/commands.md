# Docker MCP Server - Command Reference

Complete reference documentation for all Docker MCP server tools and CLI aliases.

## Table of Contents

- [MCP Tools](#mcp-tools)
- [Basic CLI Aliases](#basic-cli-aliases)
- [Advanced CLI Aliases](#advanced-cli-aliases)
- [Command Syntax](#command-syntax)
- [Options Reference](#options-reference)
- [Exit Codes](#exit-codes)
- [Environment Variables](#environment-variables)

## MCP Tools

The Docker MCP Server provides 16 core tools accessible via the Model Context Protocol:

| Tool Name | Description | Aliases Using This Tool |
|-----------|-------------|-------------------------|
| `docker-images` | List and manage Docker images | `dimages` |
| `docker-containers` | List and manage containers | `dps`, `dpsa` |
| `docker-run` | Run containers with full options | `drun` |
| `docker-logs` | View container logs | `dlogs` |
| `docker-exec` | Execute commands in containers | `dexec` |
| `docker-build` | Build Docker images | `dbuild` |
| `docker-pull` | Pull images from registries | `dpull` |
| `docker-compose` | Docker Compose operations | `dcompose`, `dup`, `ddown` |
| `docker-networks` | Network management | `dnetwork` |
| `docker-volumes` | Volume management | `dvolume` |
| `docker-inspect` | Inspect Docker objects | `dinspect` |
| `docker-prune` | System cleanup | `dprune` |
| `docker-login` | Registry authentication | `dlogin` |
| `docker-logout` | Registry logout | `dlogout` |
| `docker-bridge` | Bridge network management | `dbridge` |
| `docker-list` | List all available tools | `dlist` |

## Basic CLI Aliases

### Image Management

#### `dimages` - List Docker Images

```bash
dimages [OPTIONS]
```

**Options:**
- `-a, --all` - Show all images (default hides intermediate images)
- `--digests` - Show digests
- `-f, --filter filter` - Filter output based on conditions provided
- `--format string` - Pretty-print images using a Go template
- `--no-trunc` - Don't truncate output
- `-q, --quiet` - Only show image IDs

**Filter Options:**
- `before=<image>` - Images created before given image
- `since=<image>` - Images created since given image  
- `label=<key>` or `label=<key>=<value>` - Images with specified labels
- `reference=<pattern>` - Images whose reference matches pattern
- `dangling=true|false` - Dangling images

**Examples:**
```bash
dimages                         # List all images
dimages -a                      # Include intermediate images
dimages -q                      # Only image IDs
dimages --filter "dangling=true"  # Only dangling images
dimages --format "{{.Repository}}:{{.Tag}}"  # Custom format
```

#### `dpull` - Pull Docker Images

```bash
dpull [OPTIONS] NAME[:TAG|@DIGEST]
```

**Options:**
- `-a, --all-tags` - Download all tagged images in repository
- `--disable-content-trust` - Skip image verification (default true)
- `--platform string` - Set platform if server is multi-platform capable
- `-q, --quiet` - Suppress verbose output

**Examples:**
```bash
dpull nginx                     # Pull latest nginx
dpull nginx:alpine              # Pull specific tag
dpull ubuntu@sha256:abc123...   # Pull by digest
dpull --platform linux/arm64 nginx  # Pull for specific platform
```

#### `dbuild` - Build Docker Images

```bash
dbuild [OPTIONS] PATH | URL | -
```

**Options:**
- `-t, --tag list` - Name and optionally tag (format: name:tag)
- `-f, --file string` - Name of Dockerfile (default: PATH/Dockerfile)
- `--build-arg list` - Set build-time variables
- `--cache-from strings` - Images to consider as cache sources
- `--no-cache` - Do not use cache when building image
- `--pull` - Always attempt to pull newer version of base image
- `--rm` - Remove intermediate containers after build (default true)
- `--force-rm` - Always remove intermediate containers
- `--squash` - Squash newly built layers into single layer
- `--platform string` - Set platform if server is multi-platform
- `--progress string` - Set type of progress output (auto, plain, tty)
- `--secret stringArray` - Secret file to expose to build
- `--ssh stringArray` - SSH agent socket or keys

**Examples:**
```bash
dbuild -t myapp:latest .        # Build and tag
dbuild -f Dockerfile.prod -t myapp:prod .  # Custom Dockerfile
dbuild --no-cache -t myapp:v1.0 .  # Build without cache
dbuild --build-arg VERSION=1.0 -t myapp .  # Build with args
```

### Container Management

#### `dps` - List Running Containers

```bash
dps [OPTIONS]
```

**Options:**
- `-a, --all` - Show all containers (default shows just running)
- `-f, --filter filter` - Filter output based on conditions
- `--format string` - Pretty-print containers using Go template
- `-n, --last int` - Show n last created containers (includes all states)
- `-l, --latest` - Show latest created container (includes all states)
- `--no-trunc` - Don't truncate output
- `-q, --quiet` - Only display container IDs
- `-s, --size` - Display total file sizes

**Filter Options:**
- `id=<ID>` - Container's ID
- `name=<name>` - Container's name
- `label=<key>` or `label=<key>=<value>` - Container's label
- `status=<status>` - Container's status (created, restarting, running, removing, paused, exited, dead)
- `ancestor=<image>` - Containers created from specified image
- `before=<container>` - Containers created before specified container
- `since=<container>` - Containers created since specified container
- `volume=<volume>` - Containers that mount specified volume
- `network=<network>` - Containers connected to specified network
- `publish=<port>` or `expose=<port>` - Containers that publish/expose specified port

**Examples:**
```bash
dps                             # Running containers
dps -a                          # All containers
dps -q                          # Only container IDs
dps --filter "status=exited"    # Only exited containers
dps --format "{{.Names}}: {{.Status}}"  # Custom format
```

#### `dpsa` - List All Containers

```bash
dpsa [OPTIONS]
```

Equivalent to `dps -a`. Shows all containers regardless of state.

#### `drun` - Run Containers

```bash
drun [OPTIONS] IMAGE [COMMAND] [ARG...]
```

**Runtime Options:**
- `-d, --detach` - Run container in background
- `-i, --interactive` - Keep STDIN open even if not attached
- `-t, --tty` - Allocate pseudo-TTY
- `--rm` - Automatically remove container when it exits
- `--init` - Run init inside container that forwards signals/reaps processes

**Naming and Labels:**
- `--name string` - Assign name to container
- `--label list` - Set metadata on container

**Network and Ports:**
- `-p, --publish list` - Publish container's port(s) to host
- `-P, --publish-all` - Publish all exposed ports to random ports
- `--network string` - Connect container to network
- `--network-alias list` - Add network-scoped alias for container
- `--dns list` - Set custom DNS servers
- `--dns-search list` - Set custom DNS search domains
- `--hostname string` - Container hostname

**Storage:**
- `-v, --volume list` - Bind mount a volume
- `--mount mount` - Attach filesystem mount to container
- `-w, --workdir string` - Working directory inside container

**Environment:**
- `-e, --env list` - Set environment variables
- `--env-file list` - Read environment variables from file
- `-u, --user string` - Username or UID (format: <name|uid>[:<group|gid>])

**Resource Limits:**
- `-m, --memory bytes` - Memory limit
- `--cpus decimal` - Number of CPUs
- `--cpu-shares int` - CPU shares (relative weight)
- `--memory-swap bytes` - Swap limit equal to memory plus swap
- `--oom-kill-disable` - Disable OOM Killer
- `--pids-limit int` - Tune container pids limit
- `--ulimit ulimit` - Ulimit options

**Security:**
- `--privileged` - Give extended privileges to container
- `--user string` - Username or UID
- `--group-add list` - Add additional groups to join
- `--cap-add list` - Add Linux capabilities
- `--cap-drop list` - Drop Linux capabilities
- `--security-opt list` - Security options
- `--read-only` - Mount container's root filesystem as read only

**Other Options:**
- `--restart string` - Restart policy (no, on-failure[:max-retries], always, unless-stopped)
- `--log-driver string` - Logging driver for container
- `--log-opt list` - Log driver options
- `--entrypoint string` - Overwrite default ENTRYPOINT of image
- `--platform string` - Set platform if server is multi-platform

**Examples:**
```bash
drun nginx                      # Run nginx (latest)
drun -d --name web nginx        # Run detached with name
drun -it ubuntu bash            # Interactive shell
drun -p 8080:80 nginx           # Port mapping
drun -v /host:/container alpine # Volume mounting
drun -e NODE_ENV=production node:18  # Environment variable
drun --rm -it --name temp alpine sh  # Temporary container
drun -d --restart unless-stopped nginx  # Auto-restart
drun --memory 512m --cpus 1.0 nginx  # Resource limits
```

#### `dlogs` - View Container Logs

```bash
dlogs [OPTIONS] CONTAINER
```

**Options:**
- `-f, --follow` - Follow log output
- `--since string` - Show logs since timestamp (RFC3339 or relative)
- `--until string` - Show logs before timestamp (RFC3339 or relative)  
- `-n, --tail string` - Number of lines to show from end (default "all")
- `-t, --timestamps` - Show timestamps
- `--details` - Show extra details provided to logs

**Examples:**
```bash
dlogs webapp                    # Show all logs
dlogs -f webapp                 # Follow logs
dlogs --tail 100 webapp         # Last 100 lines
dlogs --since "2024-01-01" webapp  # Logs since date
dlogs -f --tail 50 webapp       # Follow last 50 lines
```

#### `dexec` - Execute Commands in Containers

```bash
dexec [OPTIONS] CONTAINER COMMAND [ARG...]
```

**Options:**
- `-d, --detach` - Detached mode: run command in background
- `--detach-keys string` - Override key sequence for detaching
- `-e, --env list` - Set environment variables
- `--env-file list` - Read environment variables from file
- `-i, --interactive` - Keep STDIN open
- `-t, --tty` - Allocate pseudo-TTY
- `-u, --user string` - Username or UID (format: <name|uid>[:<group|gid>])
- `-w, --workdir string` - Working directory inside container

**Examples:**
```bash
dexec webapp ls                 # Run command
dexec -it webapp bash           # Interactive shell
dexec -u root webapp chmod +x /app/script.sh  # As root user
dexec -e DEBUG=true webapp npm test  # With environment variable
```

## Advanced CLI Aliases

### Multi-Container Management

#### `dcompose` - Docker Compose Operations

```bash
dcompose [OPTIONS] COMMAND
```

**Global Options:**
- `-f, --file FILE` - Specify compose file (default: docker-compose.yml)
- `-p, --project-name NAME` - Specify project name
- `--profile PROFILE` - Specify profile to enable
- `--project-directory PATH` - Specify alternate working directory
- `--parallel int` - Control max parallelism, -1 for unlimited

**Commands:**

**`up`** - Create and start containers
```bash
dcompose up [OPTIONS] [SERVICE...]
```
Options: `-d` (detach), `--build`, `--force-recreate`, `--scale SERVICE=NUM`

**`down`** - Stop and remove containers
```bash  
dcompose down [OPTIONS]
```
Options: `-v` (volumes), `--rmi TYPE`, `--remove-orphans`

**`build`** - Build or rebuild services
```bash
dcompose build [OPTIONS] [SERVICE...]
```
Options: `--no-cache`, `--pull`, `--parallel`

**`start/stop/restart`** - Control service state
```bash
dcompose start|stop|restart [SERVICE...]
```

**`ps`** - List containers
```bash
dcompose ps [OPTIONS] [SERVICE...]
```

**`logs`** - View output from containers
```bash
dcompose logs [OPTIONS] [SERVICE...]
```
Options: `-f` (follow), `--tail NUM`

**Examples:**
```bash
dcompose up -d                  # Start all services detached
dcompose -f prod.yml up         # Use specific compose file
dcompose build --no-cache       # Rebuild without cache
dcompose logs -f webapp         # Follow webapp logs
dcompose scale webapp=3         # Scale service
```

#### `dup` / `ddown` - Quick Compose Shortcuts

```bash
dup [OPTIONS]                   # Equivalent to: dcompose up
ddown [OPTIONS]                 # Equivalent to: dcompose down
```

### Network Management

#### `dnetwork` - Docker Network Management

```bash
dnetwork COMMAND [OPTIONS]
```

**Commands:**

**`create`** - Create a network
```bash
dnetwork create [OPTIONS] NETWORK
```
Options: `--driver DRIVER`, `--subnet CIDR`, `--gateway IP`, `--internal`, `--attachable`

**`list`** - List networks
```bash
dnetwork list [OPTIONS]
```
Options: `-f FILTER`, `--format FORMAT`, `-q` (quiet)

**`inspect`** - Display detailed information
```bash
dnetwork inspect [OPTIONS] NETWORK [NETWORK...]
```

**`remove`** - Remove networks
```bash
dnetwork remove NETWORK [NETWORK...]
```

**`connect`** - Connect container to network
```bash
dnetwork connect [OPTIONS] NETWORK CONTAINER
```
Options: `--ip string`, `--link list`, `--alias list`

**`disconnect`** - Disconnect container from network
```bash
dnetwork disconnect [OPTIONS] NETWORK CONTAINER
```

**`prune`** - Remove unused networks
```bash
dnetwork prune [OPTIONS]
```
Options: `-f` (force), `--filter FILTER`

**Examples:**
```bash
dnetwork create mynet           # Create bridge network
dnetwork create --driver overlay --subnet 10.0.0.0/24 prod-net
dnetwork connect mynet webapp   # Connect container
dnetwork inspect mynet          # Show details
```

#### `dbridge` - Bridge Network Management

```bash
dbridge COMMAND [OPTIONS]
```

Specialized version of `dnetwork` focused on bridge networks only.

**Commands:**
- `list` - List bridge networks
- `create NAME [OPTIONS]` - Create bridge network  
- `remove NAME` - Remove bridge network
- `inspect NAME` - Inspect bridge details
- `connect BRIDGE CONTAINER [OPTIONS]` - Connect to bridge
- `disconnect BRIDGE CONTAINER` - Disconnect from bridge
- `prune` - Remove unused bridges

**Examples:**
```bash
dbridge list                    # List all bridges
dbridge create --subnet 172.20.0.0/16 mybridge
dbridge connect mybridge webapp --ip 172.20.0.10
```

### Volume Management

#### `dvolume` - Docker Volume Management

```bash
dvolume COMMAND [OPTIONS]
```

**Commands:**

**`create`** - Create a volume
```bash
dvolume create [OPTIONS] [VOLUME]
```
Options: `--driver DRIVER`, `--driver-opt KEY=VALUE`, `--label KEY=VALUE`

**`list`** - List volumes
```bash
dvolume list [OPTIONS]
```
Options: `-f FILTER`, `--format FORMAT`, `-q` (quiet)

**`inspect`** - Display detailed information
```bash
dvolume inspect [OPTIONS] VOLUME [VOLUME...]
```

**`remove`** - Remove volumes
```bash
dvolume remove [OPTIONS] VOLUME [VOLUME...]
```
Options: `-f` (force)

**`prune`** - Remove unused volumes
```bash
dvolume prune [OPTIONS]
```
Options: `-f` (force), `--filter FILTER`

**Examples:**
```bash
dvolume create mydata           # Create volume
dvolume list                    # List all volumes
dvolume inspect mydata          # Show volume details
dvolume remove mydata           # Remove volume
```

### System Management

#### `dinspect` - Inspect Docker Objects

```bash
dinspect [OPTIONS] NAME|ID [NAME|ID...]
```

**Options:**
- `-f, --format string` - Format output using Go template
- `-s, --size` - Display total file sizes if type is container
- `--type string` - Return JSON for specified type

**Examples:**
```bash
dinspect container webapp       # Inspect container
dinspect image nginx:latest     # Inspect image
dinspect network bridge         # Inspect network
dinspect --format '{{.State.Status}}' webapp  # Custom format
```

#### `dprune` - System Cleanup

```bash
dprune [TYPE] [OPTIONS]
```

**Types:**
- `images` - Remove unused images
- `containers` - Remove stopped containers  
- `networks` - Remove unused networks
- `volumes` - Remove unused volumes
- `all` or no type - Remove all unused objects

**Options:**
- `-f, --force` - Do not prompt for confirmation
- `-a, --all` - Remove all unused images (not just dangling)
- `--filter FILTER` - Apply filters

**Examples:**
```bash
dprune                          # Interactive system prune
dprune -f                       # Force prune
dprune images -a                # Remove all unused images
dprune --filter "until=24h"     # Remove objects older than 24h
```

### Authentication

#### `dlogin` - Docker Registry Login

```bash
dlogin [OPTIONS]
```

**Options:**
- `--username string` - Username
- `--password string` - Password
- `--password-stdin` - Take password from stdin
- `--registry string` - Registry server (default: Docker Hub)

**Examples:**
```bash
dlogin                          # Interactive login to Docker Hub
dlogin --username myuser        # Specify username
dlogin --registry ghcr.io --username myuser  # Different registry
```

#### `dlogout` - Docker Registry Logout

```bash
dlogout [OPTIONS] [SERVER]
```

**Options:**
- `--all` - Logout from all registries

**Examples:**
```bash
dlogout                         # Logout from Docker Hub
dlogout ghcr.io                 # Logout from specific registry
dlogout --all                   # Logout from all registries
```

### Development Tools

#### `ddev` - Development Workflows

```bash
ddev COMMAND [OPTIONS]
```

**Commands:**
- `start` - Start development containers
- `stop` - Stop development containers
- `shell CONTAINER` - Open shell in container
- `logs SERVICE` - Show development logs  
- `rebuild` - Rebuild development images
- `reset` - Reset development environment

#### `dclean` - Comprehensive Cleanup

```bash
dclean LEVEL [OPTIONS]
```

**Levels:**
- `light` - Remove stopped containers and dangling images
- `medium` - Light + unused networks and volumes
- `deep` - Medium + all unused images and build cache
- `nuclear` - Deep + system prune with all options

**Options:**
- `-f, --force` - Skip confirmations
- `--dry-run` - Show what would be removed
- `--keep-recent` - Keep recent images/containers

#### `dstop` - Advanced Container Stopping

```bash
dstop TARGET [OPTIONS]
```

**Targets:**
- `CONTAINER` - Stop specific container
- `all` - Stop all running containers
- `pattern:REGEX` - Stop containers matching pattern
- `compose` - Stop compose project containers

**Options:**
- `-t, --time SECONDS` - Timeout before killing
- `-f, --force` - Force stop (kill immediately)
- `--signal SIGNAL` - Signal to send

#### `dreset` - Environment Reset

```bash
dreset [SCOPE] [OPTIONS]
```

**Scopes:**
- `containers` - Reset containers only
- `images` - Reset images only
- `networks` - Reset networks only  
- `volumes` - Reset volumes only
- `all` - Complete environment reset

**Options:**
- `-f, --force` - Skip confirmations
- `--keep-images` - Keep images during reset
- `--backup` - Create backup before reset

#### `dlist` - List Tools and Aliases

```bash
dlist [CATEGORY]
```

**Categories:**
- `basic` - Basic operations only
- `advanced` - Advanced operations only  
- `all` - All tools and aliases (default)

## Command Syntax

### General Syntax Patterns

```bash
# Basic pattern
<alias> [global-options] [command] [command-options] [arguments]

# Examples
dimages --format "{{.Repository}}"     # Global option
dnetwork create --subnet 10.0.0.0/24 mynet  # Command with options
drun -d -p 80:80 --name web nginx      # Multiple options
```

### Option Formats

```bash
# Short options (single dash, single character)
-d, -f, -p, -v, -t, -i

# Long options (double dash, full words)  
--detach, --file, --publish, --volume, --tty, --interactive

# Options with values
-p 8080:80                      # Short with value
--publish 8080:80               # Long with value
-e NODE_ENV=production          # Short with key=value
--env NODE_ENV=production       # Long with key=value

# Boolean flags
-d                              # Enable detach mode
--rm                            # Enable auto-remove
```

### Argument Patterns

```bash
# Single argument
dimages                         # No arguments
dlogout                         # No arguments
dinspect webapp                 # Single container name

# Multiple arguments
dinspect webapp database        # Multiple containers
dvolume remove vol1 vol2 vol3   # Multiple volumes

# Optional arguments
dprune                          # All types (default)
dprune images                   # Specific type
dprune containers               # Another type
```

## Options Reference

### Common Options Across Commands

| Option | Short | Description | Commands |
|--------|-------|-------------|----------|
| `--help` | `-h` | Show help | All |
| `--format` | `-f` | Format output | `dimages`, `dps`, `dnetwork`, `dvolume` |
| `--quiet` | `-q` | Quiet output | `dimages`, `dps`, `dpull` |
| `--force` | `-f` | Force action | `dprune`, `dvolume remove`, `dclean` |
| `--all` | `-a` | Show/include all | `dimages`, `dps`, `dprune` |
| `--filter` | | Filter output | `dimages`, `dps`, `dnetwork`, `dvolume` |

### Port Mapping Options

```bash
# Format: [host-ip:]host-port:container-port[/protocol]
-p 80:80                        # Map port 80
-p 127.0.0.1:8080:80           # Bind to specific interface  
-p 3000-3005:3000-3005         # Port range
-p 80:80/tcp                   # Specify protocol
-p 53:53/udp                   # UDP port
```

### Volume Mounting Options

```bash
# Format: [source:]destination[:options]
-v /host/path:/container/path   # Bind mount
-v volume-name:/container/path  # Named volume
-v /container/path              # Anonymous volume
-v /host:/container:ro          # Read-only
-v /host:/container:rw          # Read-write (default)
-v /host:/container:z           # SELinux relabeling
```

### Network Options

```bash
--network bridge                # Default bridge
--network host                  # Host network
--network none                  # No network
--network container:name        # Share network with container
--network mynet                 # Custom network
```

### Resource Limit Options

```bash
--memory 512m                   # Memory limit (b, k, m, g)
--memory-swap 1g                # Memory + swap limit
--cpus 1.5                      # CPU limit (decimal)
--cpu-shares 512                # CPU weight
--pids-limit 100                # Process limit
```

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 0 | Success | Command completed successfully |
| 1 | General error | General application error |
| 2 | Misuse | Invalid command line arguments |
| 125 | Docker daemon error | Docker daemon not running or accessible |
| 126 | Container command not executable | Command cannot be invoked |
| 127 | Container command not found | Command not found in container |
| 128+n | Fatal error signal n | Container killed by signal n |

### Common Exit Code Examples

```bash
# Check exit code
drun --rm alpine echo "hello"
echo $?                         # Should be 0

# Command not found
drun --rm alpine nonexistent-command  
echo $?                         # Should be 127

# Permission denied
drun --rm alpine /root/script.sh
echo $?                         # Should be 126 (if not executable)
```

## Environment Variables

### Docker Client Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `DOCKER_HOST` | Docker daemon socket | `unix:///var/run/docker.sock` |
| `DOCKER_API_VERSION` | API version to use | Latest supported |
| `DOCKER_CONFIG` | Location of config files | `~/.docker` |
| `DOCKER_CERT_PATH` | Location of TLS certificates | `~/.docker` |
| `DOCKER_TLS_VERIFY` | Enable TLS verification | `0` |
| `DOCKER_BUILDKIT` | Enable BuildKit | `0` |

### Registry Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `DOCKER_REGISTRY` | Default registry | `https://index.docker.io/v1/` |
| `DOCKER_USERNAME` | Registry username | |
| `DOCKER_PASSWORD` | Registry password | |
| `DOCKER_TOKEN` | Registry token | |

### MCP Server Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_SERVER_PORT` | Server port | `3000` |
| `MCP_SERVER_HOST` | Server host | `localhost` |
| `DEBUG` | Enable debug logging | |

### Usage Examples

```bash
# Set Docker daemon host
export DOCKER_HOST=tcp://remote-docker:2376

# Enable BuildKit
export DOCKER_BUILDKIT=1

# Set registry credentials
export DOCKER_USERNAME=myuser
export DOCKER_PASSWORD=mypass

# Enable debug logging
export DEBUG=docker-mcp-server:*

# Use specific API version
export DOCKER_API_VERSION=1.41
```

This command reference provides complete documentation for all Docker MCP server tools and aliases, including syntax, options, examples, and configuration details.
