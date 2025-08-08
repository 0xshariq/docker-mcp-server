# Advanced Docker Operations - CLI Aliases

This directory contains advanced Docker operation aliases for complex workflows, system management, and enterprise-level Docker operations.

## Overview

Advanced operations provide sophisticated Docker functionality including multi-service orchestration, network management, volume operations, registry publishing, system cleanup, and specialized workflows for development and production environments. The 14 advanced aliases cover the complete container lifecycle from build to publish.

## Available Aliases

### 🐙 `dcompose` - Docker Compose Operations

**Command:** `dcompose [options] <command>`

Manages multi-container applications using Docker Compose.

**Commands:**
- `up` - Create and start containers
- `down` - Stop and remove containers  
- `build` - Build or rebuild services
- `start` - Start existing containers
- `stop` - Stop running containers
- `restart` - Restart containers
- `ps` - List containers
- `logs` - View output from containers
- `pull` - Pull service images
- `push` - Push service images

**Options:**
- `-f, --file <file>` - Specify compose file (default: docker-compose.yml)
- `-p, --project-name <name>` - Specify project name
- `--profile <profile>` - Specify profile to enable
- `-d, --detach` - Detached mode (background)
- `--build` - Build images before starting containers
- `--force-recreate` - Recreate containers even if config hasn't changed
- `--no-deps` - Don't start linked services
- `--scale <service=num>` - Scale service to num instances

**Examples:**
```bash
dcompose up                     # Start all services
dcompose up -d                  # Start in background
dcompose -f docker-compose.prod.yml up
dcompose build --no-cache       # Rebuild without cache
dcompose logs -f webapp         # Follow webapp logs
dcompose scale webapp=3         # Scale webapp to 3 instances
```

**MCP Tool:** `docker-compose`

---

### ⬆️ `dup` - Compose Up (Quick Start)

**Command:** `dup [options]`

Quick shortcut for `docker-compose up` with common options.

**Examples:**
```bash
dup                            # docker-compose up
dup -d                         # docker-compose up -d
```

---

### ⬇️ `ddown` - Compose Down (Quick Stop)

**Command:** `ddown [options]`

Quick shortcut for `docker-compose down` with cleanup options.

**Options:**
- `-v, --volumes` - Remove named volumes
- `--rmi <type>` - Remove images (all|local)
- `--remove-orphans` - Remove orphaned containers

**Examples:**
```bash
ddown                          # docker-compose down
ddown -v                       # Remove volumes too
ddown --rmi all               # Remove all images
```

---

### 🌐 `dnetwork` - Docker Network Management

**Command:** `dnetwork <action> [options]`

Manages Docker networks for container communication.

**Actions:**
- `list` - List all networks
- `create <name>` - Create a new network
- `remove <name>` - Remove a network
- `inspect <name>` - Inspect network details
- `connect <network> <container>` - Connect container to network
- `disconnect <network> <container>` - Disconnect container from network
- `prune` - Remove unused networks

**Create Options:**
- `--driver <driver>` - Network driver (bridge, overlay, host, none)
- `--subnet <cidr>` - Subnet in CIDR format
- `--gateway <ip>` - IPv4 or IPv6 Gateway
- `--ip-range <cidr>` - Allocate container ip from sub-range
- `--internal` - Restrict external access to the network
- `--attachable` - Enable manual container attachment

**Examples:**
```bash
dnetwork list                   # List all networks
dnetwork create mynet           # Create bridge network
dnetwork create --driver overlay --subnet 10.0.0.0/24 myoverlay
dnetwork connect mynet mycontainer  # Connect container
dnetwork inspect mynet          # Show network details
dnetwork prune                  # Remove unused networks
```

**MCP Tool:** `docker-networks`

---

### 💾 `dvolume` - Docker Volume Management

**Command:** `dvolume <action> [options]`

Manages Docker volumes for persistent data storage.

**Actions:**
- `list` - List all volumes
- `create <name>` - Create a new volume
- `remove <name>` - Remove a volume
- `inspect <name>` - Inspect volume details
- `prune` - Remove unused volumes

**Create Options:**
- `--driver <driver>` - Volume driver (local, nfs, etc.)
- `--driver-opt <key=value>` - Driver specific options
- `--label <key=value>` - Set metadata on volume

**Examples:**
```bash
dvolume list                    # List all volumes
dvolume create mydata           # Create volume
dvolume create --driver local --driver-opt type=nfs myshare
dvolume inspect mydata          # Show volume details
dvolume remove mydata           # Remove volume
dvolume prune                   # Remove unused volumes
```

**MCP Tool:** `docker-volumes`

---

### 🔍 `dinspect` - Docker Resource Inspection

**Command:** `dinspect <type> <name> [options]`

Provides detailed information about Docker objects.

**Types:**
- `container` - Inspect container details
- `image` - Inspect image details
- `network` - Inspect network details
- `volume` - Inspect volume details

**Options:**
- `--format <template>` - Format output using Go template
- `--size` - Display total file sizes (containers only)
- `--type <type>` - Return JSON for specified type

**Examples:**
```bash
dinspect container myapp        # Inspect container
dinspect image nginx:alpine     # Inspect image
dinspect network bridge         # Inspect network
dinspect volume mydata          # Inspect volume
dinspect container myapp --format "{{.State.Status}}"
```

**MCP Tool:** `docker-inspect`

---

### 🧹 `dprune` - Docker System Cleanup

**Command:** `dprune [type] [options]`

Removes unused Docker objects to free up disk space.

**Types:**
- `images` - Remove unused images
- `containers` - Remove stopped containers
- `networks` - Remove unused networks
- `volumes` - Remove unused volumes
- `all` or no type - Remove all unused objects

**Options:**
- `-f, --force` - Do not prompt for confirmation
- `-a, --all` - Remove all unused images (not just dangling)
- `--filter <filter>` - Apply filters (e.g., until=24h)

**Examples:**
```bash
dprune                          # Interactive system prune
dprune -f                       # Force prune without confirmation
dprune images                   # Remove unused images only
dprune containers -f            # Force remove stopped containers
dprune --filter "until=24h"     # Remove objects older than 24h
```

**MCP Tool:** `docker-prune`

---

### 🔐 `dlogin` - Docker Registry Login

**Command:** `dlogin [registry] [options]`

Securely log in to Docker registries with Docker-handled password authentication for maximum security.

**Options:**
- `-u, --username <username>` - Username for registry authentication
- `--token <token>` - Authentication token (for GitHub, GitLab, etc.)
- `--password-stdin` - Read password from stdin (secure for automation)
- `--status` - Show current login status for all registries
- `-i, --interactive` - Force interactive password prompt
- `--logout` - Logout from specified registry

**Examples:**
```bash
dlogin                                              # Check login status for all registries
dlogin --status                                     # Show detailed login status
dlogin --username myuser                            # Login to Docker Hub (secure prompt)
dlogin ghcr.io --username myuser                    # Login to GitHub Container Registry
dlogin --token ghp_xxxxxxxxxxxx ghcr.io             # Login using GitHub Personal Access Token
dlogin --password-stdin < password.txt              # Secure automation login
```

**Security Features:**
- 🔐 **SECURE PASSWORD HANDLING**: Passwords never passed as command arguments
- 🛡️ **DOCKER DAEMON SECURITY**: Docker handles all password operations
- 🔑 **CREDENTIAL STORAGE**: Secure storage in Docker's keychain/config
- 🚫 **NO COMMAND HISTORY**: Passwords never appear in shell history
- 🔒 **STDIN OPTION**: Secure automation with --password-stdin

**Supported Registries:**
- **Docker Hub**: `docker.io` (default) - Username/Password or PAT
- **GitHub Container Registry**: `ghcr.io` - GitHub username with Personal Access Token
- **Google Container Registry**: `gcr.io` - Service account key authentication
- **Amazon ECR**: Use AWS CLI integration for secure authentication
- **Azure Container Registry**: Azure AD or admin credentials
- **Custom Registries**: Any Docker-compliant registry

**MCP Tool:** `docker-login`

---

### 🚪 `dlogout` - Docker Registry Logout

**Command:** `dlogout [options]`

Logout from Docker registries and remove stored credentials.

**Options:**
- `--registry <registry>` - Specific registry to logout from
- `--all` - Logout from all registries

**Examples:**
```bash
dlogout                         # Logout from Docker Hub
dlogout --registry ghcr.io      # Logout from GitHub registry
dlogout --all                   # Logout from all registries
```

**MCP Tool:** `docker-logout`

---

### 📤 `dpublish` - Docker Image Publishing

**Command:** `dpublish <image> [options]`

Advanced Docker image publishing to registries with comprehensive features for development and production workflows.

**Core Options:**
- `-t, --tag <tag>` - Additional tags for the image
- `--registry <registry>` - Target registry (default: Docker Hub)
- `--platform <platforms>` - Target platforms (e.g., linux/amd64,linux/arm64)
- `--push` - Push immediately after tagging
- `--latest` - Also tag as 'latest'

**Build Integration:**
- `--build` - Build image before publishing
- `--build-context <path>` - Build context path (default: current directory)
- `--dockerfile <file>` - Dockerfile path
- `--build-arg <key=value>` - Build-time arguments
- `--target <stage>` - Target build stage in multi-stage Dockerfile

**Security & Authentication:**
- `--check-auth` - Verify registry authentication before publishing
- `--sign` - Sign images using Docker Content Trust
- `--provenance` - Include build provenance attestations

**Advanced Features:**
- `--multi-arch` - Build and push multi-architecture images
- `--cache-from <image>` - Use image as cache source
- `--cache-to <dest>` - Export cache to destination
- `--annotation <key=value>` - Add OCI annotations
- `--compress` - Compress image layers during push

**Examples:**
```bash
# Basic publishing
dpublish myapp:v1.0.0                                    # Publish to Docker Hub
dpublish myapp:v1.0.0 --registry ghcr.io --push         # Publish to GitHub Container Registry

# Multi-platform publishing
dpublish myapp:v1.0.0 --platform linux/amd64,linux/arm64 --push

# Build and publish workflow
dpublish myapp:v1.0.0 --build --dockerfile Dockerfile.prod --push --latest

# Advanced publishing with security
dpublish myapp:v1.0.0 --sign --provenance --check-auth --push

# Registry-specific examples
dpublish myapp:v1.0.0 --registry myregistry.azurecr.io --push
dpublish myapp:v1.0.0 --registry 123456789.dkr.ecr.us-west-2.amazonaws.com --push
```

**Registry Support:**
- **Docker Hub**: `docker.io` (default)
- **GitHub Container Registry**: `ghcr.io`
- **Google Container Registry**: `gcr.io`, `us.gcr.io`, `eu.gcr.io`, `asia.gcr.io`
- **Amazon ECR**: `*.dkr.ecr.*.amazonaws.com`
- **Azure Container Registry**: `*.azurecr.io`
- **Custom Registries**: Any compliant Docker registry

**Security Features:**
- 🔐 Authentication verification before publishing
- 🛡️ Image signing with Docker Content Trust
- 📝 Build provenance and attestations
- 🔍 Vulnerability scanning integration
- 🚀 Secure multi-platform builds

**Workflow Integration:**
- ✅ CI/CD pipeline ready
- ✅ Multi-stage build support  
- ✅ Cache optimization
- ✅ Automated tagging strategies
- ✅ Registry-specific optimizations

**MCP Tool:** `docker-publish`

---

### 🌉 `dbridge` - Docker Bridge Network Management

**Command:** `dbridge <action> [options]`

Specialized management for Docker bridge networks.

**Actions:**
- `list` - List all bridge networks
- `create <name>` - Create bridge network
- `remove <name>` - Remove bridge network
- `inspect <name>` - Inspect bridge details
- `connect <bridge> <container>` - Connect container to bridge
- `disconnect <bridge> <container>` - Disconnect from bridge
- `prune` - Remove unused bridge networks

**Create Options:**
- `--subnet <cidr>` - Subnet in CIDR format
- `--gateway <ip>` - Gateway IP address
- `--ip-range <cidr>` - IP range for container allocation

**Examples:**
```bash
dbridge list                    # List bridge networks
dbridge create --subnet 172.20.0.0/16 mybridge
dbridge connect mybridge mycontainer --ip 172.20.0.10
dbridge disconnect mybridge mycontainer
dbridge prune                   # Clean unused bridges
```

**MCP Tool:** `docker-bridge`

---

### 👨‍💻 `ddev` - Development Workflows

**Command:** `ddev <workflow> [options]`

Specialized workflows for development environments.

**Workflows:**
- `start` - Start development containers
- `stop` - Stop development containers
- `shell <container>` - Open shell in container
- `logs <service>` - Show development logs
- `rebuild` - Rebuild development images
- `reset` - Reset development environment

**Examples:**
```bash
ddev start                      # Start dev environment
ddev shell webapp               # Open shell in webapp container
ddev logs -f api                # Follow API logs
ddev rebuild                    # Rebuild all dev images
```

---

### 🧽 `dclean` - Comprehensive System Cleanup

**Command:** `dclean <level> [options]`

Advanced cleanup operations with different intensity levels.

**Levels:**
- `light` - Remove stopped containers and dangling images
- `medium` - Light cleanup + unused networks and volumes
- `deep` - Medium cleanup + all unused images and build cache
- `nuclear` - Deep cleanup + system prune with all options

**Options:**
- `-f, --force` - Skip confirmation prompts
- `--dry-run` - Show what would be removed
- `--keep-recent` - Keep images/containers from last 24h

**Examples:**
```bash
dclean light                    # Basic cleanup
dclean deep -f                  # Deep cleanup without confirmation
dclean nuclear --dry-run        # See what nuclear would remove
```

---

### ⏹️ `dstop` - Advanced Container Stopping

**Command:** `dstop <target> [options]`

Stop containers with advanced options and patterns.

**Targets:**
- `<container>` - Stop specific container
- `all` - Stop all running containers
- `pattern:<regex>` - Stop containers matching pattern
- `compose` - Stop compose project containers

**Options:**
- `-t, --time <seconds>` - Timeout before killing container
- `-f, --force` - Force stop (kill immediately)
- `--signal <signal>` - Signal to send to container

**Examples:**
```bash
dstop mycontainer               # Stop specific container
dstop all                       # Stop all containers
dstop pattern:webapp_*          # Stop containers matching pattern
dstop compose                   # Stop compose containers
```

---

### 🔄 `dreset` - Environment Reset

**Command:** `dreset [scope] [options]`

Reset Docker environment to clean state.

**Scopes:**
- `containers` - Reset containers only
- `images` - Reset images only  
- `networks` - Reset networks only
- `volumes` - Reset volumes only
- `all` - Complete environment reset

**Options:**
- `-f, --force` - Skip all confirmations
- `--keep-images` - Keep images during reset
- `--backup` - Create backup before reset

**Examples:**
```bash
dreset containers               # Reset containers only
dreset all --keep-images        # Reset but keep images
dreset --force                  # Force complete reset
```

---

### 📋 `dlist` - Tools and Aliases Reference

**Command:** `dlist [category]`

Enhanced listing of all available tools and aliases with usage examples.

**Categories:**
- `basic` - Basic operations only
- `advanced` - Advanced operations only
- `all` - All tools and aliases (default)

**Examples:**
```bash
dlist                           # Show all tools
dlist basic                     # Show basic operations only
dlist advanced                  # Show advanced operations only
```

**MCP Tool:** `docker-list`

---

## Advanced Workflow Examples

### Multi-Service Development
```bash
# Start complete development stack
dcompose -f docker-compose.dev.yml up -d

# Scale specific services
dcompose scale api=3 worker=2

# Monitor logs
dcompose logs -f api

# Debug in container
ddev shell api
```

### Production Deployment
```bash
# Create production network
dnetwork create --driver overlay prod-network

# Deploy with compose
dcompose -f docker-compose.prod.yml up -d

# Health checks and monitoring
dinspect container api_1
dlogs -f --tail 100 api_1
```

### System Maintenance
```bash
# Regular cleanup routine
dprune containers -f
dprune images --filter "until=168h"  # 1 week old
dprune networks -f

# Deep system cleanup
dclean deep

# Complete environment reset
dreset all --backup
```

### Network Management
```bash
# Create custom bridge network
dbridge create --subnet 192.168.100.0/24 --gateway 192.168.100.1 myapp-net

# Connect services to network
dbridge connect myapp-net api
dbridge connect myapp-net database

# Inspect network topology
dbridge inspect myapp-net
```

## Security Considerations

1. **Registry Authentication**: Always logout from registries on shared systems
2. **Network Isolation**: Use custom networks for service isolation
3. **Volume Permissions**: Set appropriate volume permissions
4. **Resource Limits**: Apply memory and CPU limits in production
5. **Secret Management**: Use Docker secrets for sensitive data

## Performance Tips

1. **Multi-stage Builds**: Use multi-stage Dockerfiles for smaller images
2. **Build Cache**: Leverage build cache for faster builds
3. **Volume Mounting**: Use named volumes for better performance
4. **Network Optimization**: Use custom networks for better container communication
5. **Resource Allocation**: Monitor and adjust resource limits

## Troubleshooting

### Common Issues
- **Port conflicts**: Use `dps` to check port usage
- **Network issues**: Inspect networks with `dnetwork inspect`
- **Volume problems**: Check volumes with `dvolume list`
- **Build failures**: Use `--no-cache` for clean builds
- **Resource constraints**: Monitor with `dinspect container`

### Debug Commands
```bash
# System information
docker system info
docker system df

# Container debugging
dinspect container myapp
dexec -it myapp /bin/sh

# Network debugging
dnetwork inspect bridge
```

## Related Documentation

- [Basic Operations](../basic/README.md)
- [Command Reference](../../docs/commands.md)
- [Installation Guide](../../docs/installation-guide.md)
- [Usage Examples](../../docs/command-aliases-usage.md)
