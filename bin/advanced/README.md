# Advanced Docker Operations - CLI Aliases

This directory contains 14 powerful Docker operation aliases designed for complex workflows, system management, and production-level Docker operations. Each command provides comprehensive functionality with extensive options and safety features.

## Overview

Advanced operations provide sophisticated Docker functionality covering the complete container ecosystem:

**🐙 Multi-Container Management** - Full Docker Compose integration for complex applications  
**🌐 Network & Volume Operations** - Advanced networking and persistent storage management  
**📤 Registry Operations** - Secure login, logout, and publishing to all major container registries  
**🧹 System Maintenance** - Intelligent cleanup, pruning, and system optimization  
**⚡ Development Workflows** - Specialized tools for development and production environments

**All 14 Advanced Commands:**
- `dcompose`, `dup`, `ddown` - Docker Compose orchestration
- `dnetwork`, `dvolume` - Network and volume management  
- `dinspect`, `dprune` - System inspection and cleanup
- `dlogin`, `dlogout`, `dpublish` - Registry authentication and publishing
- `dbridge`, `ddev`, `dclean` - Specialized workflows
- `dstop`, `dreset` - Advanced container and system control

**💡 Pro Tips:**
- Every command supports `--help` or `-h` for comprehensive documentation
- Use `--dry-run` where available to preview operations safely
- Commands have built-in safety checks for destructive operations

## Command Details

### 🐙 `dcompose` - Docker Compose Operations

**Purpose:** Manage multi-container Docker applications using Docker Compose with full workflow support for development and production environments.

**Command:** `dcompose [global-options] <command> [command-options]`

**Global Options:**
- `-f, --file <file>` - Specify compose file (default: docker-compose.yml)
- `-p, --project-name <name>` - Override project name
- `--profile <profile>` - Specify profile to enable
- `--env-file <file>` - Specify environment file
- `--parallel <num>` - Control parallel operations (default: auto)
- `-h, --help` - Show detailed help information

**Essential Commands:**

**Lifecycle Management:**
- `up [options]` - Create and start containers
  - `-d, --detach` - Run in background
  - `--build` - Build images before starting
  - `--force-recreate` - Recreate containers even if unchanged
  - `--no-deps` - Don't start linked services
  - `--scale service=num` - Scale service to num instances
  
- `down [options]` - Stop and remove containers
  - `-v, --volumes` - Remove named volumes too
  - `--rmi type` - Remove images (all|local)
  - `--remove-orphans` - Remove orphaned containers

- `restart [options] [services]` - Restart services
- `stop [services]` - Stop running services
- `start [services]` - Start stopped services

**Image Management:**
- `build [options] [services]` - Build/rebuild service images
  - `--no-cache` - Build without using cache
  - `--pull` - Always pull newer versions of base images
  - `--parallel` - Build images in parallel
  
- `pull [options] [services]` - Pull service images
- `push [services]` - Push service images to registry

**Information & Monitoring:**
- `ps [options]` - List containers
- `logs [options] [services]` - View output from containers
  - `-f, --follow` - Follow log output
  - `--tail=num` - Number of lines to show from end
  - `-t, --timestamps` - Show timestamps
- `exec [options] service command` - Execute command in running container
- `top [services]` - Display running processes

**Common Use Cases:**
```bash
# Basic operations
dcompose --help                         # Show comprehensive help
dcompose up                             # Start all services
dcompose up -d                          # Start in background (detached)
dcompose down                           # Stop and remove all

# Development workflow
dcompose -f docker-compose.dev.yml up  # Use development config
dcompose up --build                     # Rebuild images on start
dcompose logs -f web                    # Follow web service logs

# Production deployment
dcompose -f docker-compose.prod.yml up -d --scale web=3
dcompose restart web                    # Restart just web service
dcompose down --volumes                 # Full cleanup with volumes

# Service-specific operations
dcompose build web                      # Rebuild web service only
dcompose exec web bash                  # Shell into web container
dcompose logs --tail=100 database       # Last 100 database logs

# Multiple environments
dcompose --profile prod up              # Start production profile
dcompose -p myproject up                # Custom project name
```

**Configuration File Examples:**
```yaml
# Basic docker-compose.yml structure
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
  database:
    image: postgres:13
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

**Advanced Features:**
- **Profiles** - Conditional service activation (`--profile prod`)
- **Scaling** - Run multiple instances (`--scale web=3`)
- **Dependencies** - Service startup ordering with `depends_on`
- **Health Checks** - Container health monitoring
- **Networks** - Custom networking between services

**Troubleshooting:**
- **Port conflicts** - Use different ports or stop conflicting services
- **Build failures** - Check Dockerfile and build context
- **Network issues** - Verify service names and network configuration
- **Volume permissions** - Check file ownership and Docker volume mounts

**Related Commands:** `dup` (quick up), `ddown` (quick down), `dnetwork` (networking), `dvolume` (storage)  
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

**Purpose:** Create, manage, and troubleshoot Docker networks for container communication, providing isolated networking environments and service discovery.

**Command:** `dnetwork <action> [options] [network-name]`

**Core Actions:**
- `create` - Create a new network
- `list` - List all networks
- `inspect` - Show detailed network information
- `remove` - Delete a network
- `connect` - Connect container to network
- `disconnect` - Disconnect container from network
- `prune` - Remove unused networks

**Essential Options:**

**For Network Creation:**
- `--driver <driver>` - Network driver (bridge|overlay|host|macvlan|none)
- `--subnet <subnet>` - Subnet in CIDR format (e.g., 192.168.1.0/24)
- `--gateway <gateway>` - IPv4 or IPv6 gateway address
- `--ip-range <range>` - Allocate container IP from sub-range
- `--internal` - Create internal network (no external connectivity)
- `--attachable` - Enable manual container attachment (overlay networks)
- `--scope <scope>` - Network scope (local|global|swarm)

**For Container Connection:**
- `--ip <ip>` - Assign specific IP address to container
- `--alias <alias>` - Add network-scoped alias for container
- `--link <container>` - Add legacy link to container (deprecated)

**Network Drivers Explained:**
- **bridge** - Default isolated network for containers on single host
- **overlay** - Multi-host networking for Docker Swarm
- **host** - Remove network isolation, use host's network directly
- **macvlan** - Assign MAC addresses, appear as physical devices
- **none** - Disable networking completely

**Common Use Cases:**

**Basic Network Operations:**
```bash
# Network management
dnetwork --help                     # Show comprehensive help
dnetwork list                       # List all networks
dnetwork create myapp-network       # Create bridge network
dnetwork inspect bridge             # Inspect default bridge

# Custom network creation
dnetwork create --driver bridge --subnet 172.20.0.0/16 --gateway 172.20.0.1 custom-net
dnetwork create --internal private-net    # Internal only network
dnetwork create --driver overlay swarm-net    # Multi-host overlay

# Container connectivity
dnetwork connect myapp-network web-container
dnetwork connect --ip 172.20.0.10 custom-net api-container
dnetwork disconnect myapp-network web-container

# Cleanup operations
dnetwork remove myapp-network       # Remove specific network
dnetwork prune                      # Remove unused networks
```

**Advanced Network Scenarios:**
```bash
# Multi-tier application
dnetwork create --subnet 10.0.1.0/24 frontend-net
dnetwork create --subnet 10.0.2.0/24 --internal backend-net
dnetwork create --subnet 10.0.3.0/24 --internal database-net

# Service discovery setup
dnetwork create --driver overlay --attachable microservices
dnetwork connect --alias api microservices api-container
dnetwork connect --alias db microservices postgres-container

# Development environment
dnetwork create dev-network
dnetwork connect --alias webapp dev-network web-container
dnetwork connect --alias cache dev-network redis-container
```

**Network Inspection & Troubleshooting:**
```bash
# Detailed network information
dnetwork inspect myapp-network      # Show network configuration
dnetwork inspect --format '{{.IPAM.Config}}' bridge  # Show IP allocation

# Container network status
docker container inspect web-container --format '{{.NetworkSettings.Networks}}'
```

**Security & Isolation:**
- **Network Segmentation** - Separate environments (prod/dev/test)
- **Internal Networks** - Database tiers without internet access
- **Custom Subnets** - Avoid IP conflicts with host networks
- **Container Aliases** - Service discovery without hardcoded IPs

**Best Practices:**
- Use custom networks instead of default bridge for better isolation
- Plan IP addressing to avoid conflicts with host networks
- Use meaningful network names that reflect their purpose
- Implement network segmentation for security (frontend/backend/database)
- Use overlay networks for multi-host container communication
- Regular cleanup of unused networks to prevent resource waste

**Troubleshooting Common Issues:**
- **Port conflicts** - Check host port bindings and network ranges
- **DNS resolution** - Verify container aliases and network membership
- **IP exhaustion** - Monitor subnet usage and expand ranges if needed
- **Connectivity issues** - Check firewall rules and network driver compatibility
- **Performance** - Consider network driver overhead (overlay vs bridge)

**Integration with Docker Compose:**
```yaml
# docker-compose.yml network configuration
networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  backend:
    driver: bridge
    internal: true
```

**Related Commands:** `dcompose` (multi-container networking), `dinspect` (detailed inspection), `drun` (network assignment)  
**MCP Tool:** `docker-network`

---

**MCP Tool:** `docker-networks`

---

### 💾 `dvolume` - Docker Volume Management

**Purpose:** Create, manage, and maintain Docker volumes for persistent data storage, enabling data persistence across container lifecycles and sharing between containers.

**Command:** `dvolume <action> [options] [volume-name]`

**Core Actions:**
- `create` - Create a new volume
- `list` - List all volumes
- `inspect` - Show detailed volume information
- `remove` - Delete a volume
- `prune` - Remove unused volumes

**Essential Options:**

**For Volume Creation:**
- `--driver <driver>` - Volume driver (local|nfs|azure|gce|etc.)
- `--opt <key>=<value>` - Set driver specific options
- `--label <key>=<value>` - Add metadata labels
- `--name <name>` - Specify volume name (alternative to positional arg)

**For Volume Listing:**
- `-q, --quiet` - Only show volume names
- `--filter <filter>` - Filter volumes by criteria
- `--format <format>` - Pretty-print using Go template

**Volume Drivers Explained:**
- **local** - Default driver, stores on Docker host filesystem
- **nfs** - Network File System for shared storage
- **azure** - Azure File Storage integration
- **gce** - Google Compute Engine persistent disks
- **custom** - Third-party storage drivers (REX-Ray, Portworx, etc.)

**Common Use Cases:**

**Basic Volume Operations:**
```bash
# Volume management
dvolume --help                      # Show comprehensive help
dvolume list                        # List all volumes
dvolume create data-volume          # Create named volume
dvolume inspect data-volume         # Show volume details

# Volume with options
dvolume create --driver local --opt type=none --opt o=bind --opt device=/host/data mounted-data
dvolume create --label env=production --label backup=daily prod-database
dvolume create postgres-data        # Database persistence

# Cleanup operations
dvolume remove old-data             # Remove specific volume
dvolume prune                       # Remove unused volumes
```

**Database Persistence Examples:**
```bash
# PostgreSQL data persistence
dvolume create postgres-data
docker run -d --name postgres -v postgres-data:/var/lib/postgresql/data postgres:13

# MySQL data persistence  
dvolume create mysql-data
docker run -d --name mysql -v mysql-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=secret mysql:8

# MongoDB data persistence
dvolume create mongodb-data
docker run -d --name mongo -v mongodb-data:/data/db mongo:latest
```

**Application Data Scenarios:**
```bash
# Web application uploads
dvolume create webapp-uploads
docker run -d --name webapp -v webapp-uploads:/app/uploads nginx

# Configuration persistence
dvolume create nginx-config
docker run -d --name nginx -v nginx-config:/etc/nginx nginx

# Log aggregation
dvolume create app-logs
docker run -d --name app -v app-logs:/var/log/app myapp:latest
docker run -d --name logstash -v app-logs:/input logstash
```

**Advanced Volume Management:**
```bash
# Labeled volume creation for organization
dvolume create --label project=ecommerce --label tier=database ecom-db-data
dvolume create --label project=ecommerce --label tier=cache ecom-redis-data

# Custom mount options
dvolume create --driver local --opt type=tmpfs --opt device=tmpfs temp-storage
dvolume create --driver local --opt type=nfs --opt o=addr=192.168.1.100 shared-data

# Volume filtering and inspection
dvolume list --filter "label=project=ecommerce"
dvolume list --filter "dangling=true"        # Find unused volumes
dvolume inspect --format '{{.Mountpoint}}' data-volume
```

**Volume Backup & Migration:**
```bash
# Backup volume data (requires running container)
docker run --rm -v data-volume:/source -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /source .

# Restore volume data
docker run --rm -v data-volume:/target -v $(pwd):/backup alpine tar xzf /backup/data-backup.tar.gz -C /target

# Copy between volumes
docker run --rm -v old-volume:/source -v new-volume:/target alpine cp -a /source/. /target/
```

**Volume Inspection & Troubleshooting:**
```bash
# Detailed volume information
dvolume inspect data-volume         # Full volume metadata
dvolume inspect --format '{{.Driver}}' data-volume    # Show driver only
dvolume inspect --format '{{.Labels}}' data-volume    # Show labels only

# Volume usage analysis
dvolume list --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
docker system df -v                 # Show volume space usage
```

**Security & Best Practices:**
- **Data Isolation** - Use separate volumes for different applications
- **Access Control** - Set proper file permissions within containers
- **Backup Strategy** - Regular data backups for critical volumes
- **Cleanup Policy** - Remove unused volumes to prevent disk space issues
- **Labels** - Tag volumes for easier organization and management
- **Driver Selection** - Choose appropriate drivers for performance and requirements

**Performance Considerations:**
- **Local vs Network** - Local drivers offer better performance
- **Volume Location** - Consider SSD placement for high I/O workloads
- **Mount Points** - Use efficient filesystem mount options
- **Container Lifecycle** - Minimize volume creation/destruction overhead

**Integration with Docker Compose:**
```yaml
# docker-compose.yml volume configuration
services:
  database:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config:/etc/postgresql/conf.d:ro
  web:
    image: webapp:latest
    volumes:
      - static_files:/app/static
      - media_uploads:/app/media

volumes:
  postgres_data:
    driver: local
    labels:
      backup: daily
      environment: production
  static_files:
    driver: local
  media_uploads:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /host/uploads
```

**Troubleshooting Common Issues:**
- **Permission errors** - Check file ownership and container user mapping
- **Mount failures** - Verify volume exists and host paths are accessible
- **Performance issues** - Consider volume driver and storage backend
- **Space issues** - Monitor disk usage and prune unused volumes
- **Data corruption** - Implement proper backup and validation strategies

**Related Commands:** `drun` (volume mounting), `dcompose` (multi-container volumes), `dinspect` (detailed inspection)  
**MCP Tool:** `docker-volume`

---

---

### 🔍 `dinspect` - Docker Object Inspection

**Purpose:** Examine detailed low-level information about Docker objects (containers, images, networks, volumes) for debugging, configuration analysis, and system administration.

**Command:** `dinspect <object-type> <object-id> [options]`

**Supported Object Types:**
- `image` - Docker images and their layers
- `container` - Running and stopped containers
- `network` - Docker networks and their configuration
- `volume` - Docker volumes and mount information

**Essential Options:**
- `--format <template>` - Format output using Go templates
- `--size` - Include size information (images/containers)
- `--type <type>` - Specify object type explicitly
- `-h, --help` - Show detailed help information

**Output Formatting:**
- **JSON** - Default structured output for programmatic use
- **Templates** - Custom formatting with Go template syntax
- **Specific Fields** - Extract particular configuration values
- **Human Readable** - Formatted for easy reading

**Common Use Cases:**

**Container Inspection:**
```bash
# Basic container inspection
dinspect --help                     # Show comprehensive help
dinspect container web-app          # Full container details
dinspect container --size web-app   # Include size information

# Specific container information
dinspect container --format '{{.State.Status}}' web-app
dinspect container --format '{{.Config.Image}}' web-app
dinspect container --format '{{.NetworkSettings.IPAddress}}' web-app
dinspect container --format '{{range .Mounts}}{{.Source}}:{{.Destination}}{{end}}' web-app

# Container configuration analysis
dinspect container --format '{{.Config.Env}}' web-app          # Environment variables
dinspect container --format '{{.Config.ExposedPorts}}' web-app # Exposed ports
dinspect container --format '{{.HostConfig.RestartPolicy}}' web-app # Restart policy
```

**Image Inspection:**
```bash
# Image analysis
dinspect image nginx:latest         # Full image metadata
dinspect image --size nginx:latest  # Include layer sizes

# Image layer information
dinspect image --format '{{.RootFS.Layers}}' nginx:latest
dinspect image --format '{{.Config.Cmd}}' nginx:latest         # Default command
dinspect image --format '{{.Config.WorkingDir}}' nginx:latest   # Working directory
dinspect image --format '{{.Config.ExposedPorts}}' nginx:latest # Exposed ports

# Build and history information
dinspect image --format '{{.Created}}' nginx:latest            # Creation date
dinspect image --format '{{.Author}}' nginx:latest             # Image author
dinspect image --format '{{.Config.Labels}}' nginx:latest      # Image labels
```

**Network Inspection:**
```bash
# Network configuration analysis
dinspect network bridge             # Default bridge network
dinspect network custom-network     # Custom network details

# Network connectivity information
dinspect network --format '{{.IPAM.Config}}' bridge           # IP allocation
dinspect network --format '{{.Containers}}' bridge            # Connected containers
dinspect network --format '{{.Options}}' bridge               # Network options
dinspect network --format '{{.Scope}}' overlay-net           # Network scope
```

**Volume Inspection:**
```bash
# Volume analysis
dinspect volume data-volume         # Volume configuration
dinspect volume --format '{{.Mountpoint}}' data-volume       # Mount location
dinspect volume --format '{{.Driver}}' data-volume           # Volume driver
dinspect volume --format '{{.Labels}}' data-volume           # Volume labels
dinspect volume --format '{{.Options}}' nfs-volume          # Driver options
```

**Advanced Template Examples:**
```bash
# Container resource usage
dinspect container --format 'CPU: {{.HostConfig.CpuShares}}, Memory: {{.HostConfig.Memory}}' web-app

# Network summary for all containers
for container in $(docker ps -q); do
  echo "Container: $(docker inspect --format '{{.Name}}' $container)"
  dinspect container --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}}: {{$conf.IPAddress}}{{end}}' $container
done

# Image vulnerability scanning preparation
dinspect image --format '{{.Os}}/{{.Architecture}} - {{.Config.User}}' security-app

# Volume usage tracking
dinspect volume --format 'Volume: {{.Name}}, Driver: {{.Driver}}, Created: {{.CreatedAt}}' $(docker volume ls -q)
```

**Configuration Validation:**
```bash
# Verify container configuration
dinspect container --format '{{.Config.Image}}' web-app      # Correct image
dinspect container --format '{{.Config.User}}' web-app       # Running user
dinspect container --format '{{.HostConfig.Privileged}}' web-app # Privilege level

# Security analysis
dinspect container --format '{{.HostConfig.SecurityOpt}}' web-app    # Security options
dinspect container --format '{{.AppArmorProfile}}' web-app           # AppArmor profile
dinspect container --format '{{.HostConfig.ReadonlyRootfs}}' web-app # Read-only filesystem
```

**Troubleshooting Scenarios:**
```bash
# Container startup issues
dinspect container --format '{{.State.Error}}' failed-container
dinspect container --format '{{.State.ExitCode}}' failed-container
dinspect container --format '{{.Config.Cmd}}' failed-container

# Network connectivity problems
dinspect container --format '{{.NetworkSettings.Networks}}' web-app
dinspect network --format '{{.Containers}}' problematic-network

# Volume mount issues  
dinspect container --format '{{range .Mounts}}{{.Type}}: {{.Source}} -> {{.Destination}} ({{.Mode}}){{end}}' web-app
dinspect volume --format '{{.Mountpoint}}' data-volume
```

**Automation & Scripting:**
```bash
# Extract configuration for backup
dinspect container --format '{{json .Config}}' web-app > container-config.json
dinspect image --format '{{json .Config}}' app:latest > image-config.json

# Batch inspection
docker ps -q | xargs -I {} dinspect container --format '{{.Name}}: {{.State.Status}}' {}
docker volume ls -q | xargs -I {} dinspect volume --format '{{.Name}}: {{.Driver}}' {}

# Health check monitoring
dinspect container --format '{{.State.Health.Status}}' monitored-app
dinspect container --format '{{range .State.Health.Log}}{{.Output}}{{end}}' monitored-app
```

**Performance Analysis:**
```bash
# Resource consumption
dinspect container --format 'Memory Limit: {{.HostConfig.Memory}}' web-app
dinspect container --format 'CPU Shares: {{.HostConfig.CpuShares}}' web-app
dinspect container --format 'Swap Limit: {{.HostConfig.MemorySwap}}' web-app

# Storage information
dinspect container --size --format 'Container Size: {{.SizeRw}}, Virtual Size: {{.SizeRootFs}}' web-app
dinspect image --size --format 'Image Size: {{.Size}}' nginx:latest
```

**Security Auditing:**
```bash
# Container security posture
dinspect container --format 'Privileged: {{.HostConfig.Privileged}}' web-app
dinspect container --format 'Capabilities: {{.HostConfig.CapAdd}} / {{.HostConfig.CapDrop}}' web-app
dinspect container --format 'User: {{.Config.User}}' web-app

# Network security
dinspect network --format 'Internal: {{.Internal}}, Scope: {{.Scope}}' secure-network
dinspect container --format 'Published Ports: {{.NetworkSettings.Ports}}' web-app
```

**Integration with Other Tools:**
```bash
# Export for external analysis
dinspect container web-app | jq '.Config.Env' > container-env.json
dinspect image app:latest | jq '.Config.Labels' > image-labels.json

# Configuration drift detection
dinspect container --format '{{json .Config}}' production-app > current-config.json
diff expected-config.json current-config.json

# Monitoring integration
dinspect container --format '{{.State.Health.Status}}' app | grep -v healthy && alert
```

**Best Practices:**
- Use specific templates to extract only needed information for performance
- Combine with other Docker commands for comprehensive system analysis
- Regular inspection for configuration drift detection
- Save inspection output for historical comparison and troubleshooting
- Use JSON output for programmatic processing and automation

**Troubleshooting Common Issues:**
- **Template errors** - Verify Go template syntax and field names
- **Object not found** - Check object existence and correct naming
- **Permission denied** - Ensure Docker daemon access and proper privileges
- **Large output** - Use specific templates to limit information displayed

**Related Commands:** `dcompose` (service inspection), `dnetwork` (network details), `dvolume` (volume details)  
**MCP Tool:** `docker-inspect`

---

---

### 🧹 `dprune` - Docker System Cleanup

**Purpose:** Remove unused Docker objects (containers, images, networks, volumes) to reclaim disk space and maintain a clean Docker environment with comprehensive cleanup options.

**Command:** `dprune [object-type] [options]`

**Object Types:**
- `images` - Remove unused images
- `containers` - Remove stopped containers  
- `networks` - Remove unused networks
- `volumes` - Remove unused volumes
- `system` - Remove all unused objects (comprehensive cleanup)

**Essential Options:**
- `--all` - Remove all unused objects, not just dangling ones
- `--force` - Do not prompt for confirmation
- `--filter <filter>` - Apply filters to narrow down cleanup
- `--volumes` - Include volumes in system prune (use with caution)
- `-h, --help` - Show detailed help information

**Safety Levels:**
- **Conservative** - Remove only clearly unused objects (default)
- **Aggressive** - Remove all unused objects with `--all` flag
- **Comprehensive** - Full system cleanup including volumes

**Common Use Cases:**

**Basic Cleanup Operations:**
```bash
# System overview and help
dprune --help                       # Show comprehensive help
docker system df                    # Show disk usage before cleanup

# Conservative cleanup (recommended)
dprune containers                   # Remove stopped containers only
dprune images                       # Remove dangling images only
dprune networks                     # Remove unused networks
dprune system                       # Basic system cleanup

# Aggressive cleanup (use carefully)
dprune images --all                 # Remove ALL unused images
dprune system --all                 # Remove all unused objects
dprune system --all --volumes       # Full cleanup including volumes
```

**Filtered Cleanup:**
```bash
# Time-based filtering
dprune images --filter "until=24h"         # Images older than 24 hours
dprune containers --filter "until=72h"     # Containers older than 3 days
dprune system --filter "until=168h"        # Objects older than 1 week

# Label-based filtering  
dprune images --filter "label=environment=development"
dprune containers --filter "label=temporary=true"
dprune volumes --filter "label!=backup=required"

# Size-based filtering (where supported)
dprune images --filter "dangling=true"     # Only dangling images
dprune networks --filter "scope=local"     # Only local networks
```

**Scheduled Maintenance:**
```bash
# Development environment daily cleanup
dprune containers --force          # Remove stopped containers
dprune images --force              # Remove dangling images  
dprune networks --force            # Remove unused networks

# Weekly aggressive cleanup (development only)
dprune system --all --force        # Remove all unused objects
dprune volumes --force             # Remove unused volumes (careful!)

# Production environment (very conservative)
dprune containers --filter "until=168h" --force    # Only old containers
dprune images --filter "dangling=true" --force     # Only dangling images
```

**Best Practices:**
- **Regular Maintenance** - Schedule periodic cleanup to prevent disk space issues
- **Test First** - Run cleanup commands without `--force` to review what will be removed
- **Backup Important Data** - Ensure critical volumes and images are backed up
- **Use Filters** - Apply specific filters to avoid removing important objects
- **Monitor Impact** - Track disk space usage before and after cleanup
- **Environment Separation** - Use different cleanup strategies for dev/staging/prod

**Safety Considerations:**
- **Volume Cleanup** - Be extremely careful with volume pruning, data loss is permanent
- **Production Environments** - Use conservative settings and manual review
- **Shared Systems** - Coordinate with team members before aggressive cleanup
- **Active Containers** - Ensure no critical containers are stopped before container pruning
- **Image Dependencies** - Verify no important applications depend on images before removal

**Troubleshooting:**
- **Permission Errors** - Ensure proper Docker daemon access
- **Cleanup Failures** - Check for containers still using resources
- **Space Not Reclaimed** - Verify Docker root directory location
- **Filter Syntax** - Use proper filter format and supported values

**Related Commands:** `docker system df` (space usage), `dimages` (image listing), `dps` (container status)  
**MCP Tool:** `docker-prune`

---

---

### 🔐 `dlogin` - Docker Registry Authentication

**Purpose:** Securely authenticate with Docker registries (Docker Hub, GitHub, Google Cloud, etc.) using best security practices and secure credential handling.

**Command:** `dlogin [registry] [options]`

**Supported Registries:**
- **Docker Hub** - `docker.io` (default registry)
- **GitHub Container Registry** - `ghcr.io`
- **Google Container Registry** - `gcr.io`  
- **Amazon ECR** - Regional endpoints (e.g., `123456.dkr.ecr.us-west-2.amazonaws.com`)
- **Azure Container Registry** - `*.azurecr.io`
- **Custom Registries** - Any private Docker registry

**Essential Options:**
- `-u, --username <username>` - Username for registry authentication
- `--password-stdin` - Read password from stdin (secure for automation)
- `--status` - Show current login status for all registries
- `--logout` - Logout from specified registry
- `-h, --help` - Show detailed help information

**Security Features:**
- 🔐 **Secure Password Handling** - Passwords never exposed in command line
- 🛡️ **Docker Daemon Security** - All credentials handled by Docker daemon
- 🔑 **Credential Storage** - Secure storage in Docker's credential store
- 🚫 **No Command History** - Passwords never appear in shell history
- 🔒 **Standard Input** - Secure automation with `--password-stdin`

**Common Use Cases:**

**Interactive Authentication:**
```bash
# Registry status and help
dlogin --help                       # Show comprehensive help
dlogin --status                     # Show login status for all registries

# Docker Hub login (most common)
dlogin                              # Login to Docker Hub interactively
dlogin --username myusername        # Login with specific username
dlogin docker.io --username myuser  # Explicit Docker Hub login

# Other registry logins
dlogin ghcr.io --username githubuser      # GitHub Container Registry
dlogin gcr.io --username _json_key        # Google Container Registry
dlogin myregistry.azurecr.io --username myacr # Azure Container Registry
```

**Automated Authentication:**
```bash
# Secure automation (recommended)
echo "$DOCKER_PASSWORD" | dlogin --username "$DOCKER_USERNAME" --password-stdin
echo "$GITHUB_TOKEN" | dlogin ghcr.io --username "$GITHUB_USERNAME" --password-stdin

# CI/CD pipeline examples
cat /secrets/docker-password | dlogin --username ci-user --password-stdin
printf '%s' "$REGISTRY_TOKEN" | dlogin private-registry.com --username service-account --password-stdin

# Environment-based login
export DOCKER_PASSWORD="secure_password"
echo "$DOCKER_PASSWORD" | dlogin --username automated-user --password-stdin
```

**Registry-Specific Examples:**

**Docker Hub:**
```bash
# Personal account
dlogin --username developer123

# Organization account
dlogin --username mycompany+bot

# Using access tokens (recommended for automation)
echo "$DOCKER_HUB_TOKEN" | dlogin --username myusername --password-stdin
```

**GitHub Container Registry:**
```bash
# Personal access token (recommended)
echo "$GITHUB_TOKEN" | dlogin ghcr.io --username githubuser --password-stdin

# Classic token authentication
dlogin ghcr.io --username myuser
# Enter personal access token when prompted

# GitHub Actions integration
echo "${{ secrets.GITHUB_TOKEN }}" | dlogin ghcr.io --username ${{ github.actor }} --password-stdin
```

**Google Container Registry:**
```bash
# Service account key file
cat /path/to/service-account.json | dlogin gcr.io --username _json_key --password-stdin

# Using gcloud SDK
gcloud auth configure-docker
# No dlogin needed after gcloud setup
```

**Amazon ECR:**
```bash
# Using AWS CLI (recommended)
aws ecr get-login-password --region us-west-2 | dlogin 123456.dkr.ecr.us-west-2.amazonaws.com --username AWS --password-stdin

# With specific profile
aws --profile production ecr get-login-password --region us-east-1 | dlogin 123456.dkr.ecr.us-east-1.amazonaws.com --username AWS --password-stdin
```

**Azure Container Registry:**
```bash
# Using Azure CLI
az acr login --name myregistry

# Manual authentication
echo "$ACR_PASSWORD" | dlogin myregistry.azurecr.io --username myregistry --password-stdin
```

**Authentication Management:**
```bash
# Check authentication status
dlogin --status                     # Show all registry login status
docker info | grep -A 5 "Registry"  # Show configured registries

# Logout operations
dlogin --logout                     # Logout from Docker Hub
dlogin ghcr.io --logout            # Logout from GitHub registry
dlogin --logout --all              # Logout from all registries

# Credential verification
docker config list                 # Show Docker configurations
docker system info                 # Comprehensive Docker system info
```

**CI/CD Integration Examples:**

**GitHub Actions:**
```yaml
- name: Login to Docker Hub
  run: echo "${{ secrets.DOCKER_PASSWORD }}" | dlogin --username "${{ secrets.DOCKER_USERNAME }}" --password-stdin

- name: Login to GitHub Container Registry  
  run: echo "${{ secrets.GITHUB_TOKEN }}" | dlogin ghcr.io --username ${{ github.actor }} --password-stdin
```

**GitLab CI:**
```yaml
before_script:
  - echo "$CI_REGISTRY_PASSWORD" | dlogin "$CI_REGISTRY" --username "$CI_REGISTRY_USER" --password-stdin
```

**Jenkins Pipeline:**
```groovy
withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
    sh 'echo "$DOCKER_PASS" | dlogin --username "$DOCKER_USER" --password-stdin'
}
```

**Security Best Practices:**
- **Access Tokens** - Use registry-specific access tokens instead of passwords
- **Least Privilege** - Grant minimal necessary permissions to service accounts
- **Token Rotation** - Regularly rotate authentication tokens and passwords
- **Secure Storage** - Store credentials in proper secrets management systems
- **Audit Logging** - Monitor and log authentication activities
- **Network Security** - Use TLS/SSL for all registry communications

**Troubleshooting Common Issues:**
- **Authentication failures** - Verify username, password/token, and registry URL
- **Permission denied** - Check user permissions and repository access rights  
- **Token expired** - Renew access tokens and update stored credentials
- **Registry unreachable** - Verify network connectivity and registry status
- **Credential store errors** - Check Docker credential helper configuration

**Environment Variables:**
```bash
# Standard Docker environment variables
export DOCKER_USERNAME="myuser"
export DOCKER_PASSWORD="mypassword"
export DOCKER_REGISTRY="docker.io"

# Registry-specific variables
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export AWS_PROFILE="production"
```

**Integration with Docker Compose:**
```yaml
# docker-compose.yml with private registry
services:
  app:
    image: private-registry.com/myapp:latest
    # Requires prior authentication with dlogin
```

**Related Commands:** `dlogout` (registry logout), `dpublish` (image publishing), `dpull` (image pulling from registries)  
**MCP Tool:** `docker-login`

---
- **Azure Container Registry**: Azure AD or admin credentials
- **Custom Registries**: Any Docker-compliant registry

**MCP Tool:** `docker-login`

---

### 🚪 `dlogout` - Docker Registry Logout

**Purpose:** Securely logout from Docker registries and clear stored authentication credentials for security and access management.

**Command:** `dlogout [registry] [options]`

**Supported Registries:**
- **Docker Hub** - `docker.io` (default registry)
- **GitHub Container Registry** - `ghcr.io`
- **Google Container Registry** - `gcr.io`
- **Amazon ECR** - Regional endpoints (e.g., `123456.dkr.ecr.us-west-2.amazonaws.com`)
- **Azure Container Registry** - `*.azurecr.io`
- **Custom Registries** - Any private Docker registry

**Essential Options:**
- `--all` - Logout from all configured registries
- `--status` - Show current logout status verification
- `-h, --help` - Show detailed help information

**Common Use Cases:**

**Basic Logout Operations:**
```bash
# Registry logout and help
dlogout --help                      # Show comprehensive help
dlogout --status                    # Verify current authentication status

# Single registry logout
dlogout                             # Logout from Docker Hub (default)
dlogout ghcr.io                     # Logout from GitHub Container Registry
dlogout gcr.io                      # Logout from Google Container Registry

# Multiple registry logout
dlogout --all                       # Logout from all configured registries
```

**Security Scenarios:**
```bash
# Development environment cleanup
dlogout --all                       # Clear all stored credentials
dlogout ghcr.io                     # Clear GitHub credentials only

# Shared system security
dlogout docker.io                   # Remove Docker Hub credentials
dlogout mycompany.azurecr.io        # Remove company registry access
```

**Security Best Practices:**
- **Regular Logout** - Clear credentials when not needed
- **Shared Systems** - Always logout on shared/public machines
- **Development** - Clear credentials when switching projects
- **CI/CD Security** - Clean up credentials after pipeline completion
- **Credential Rotation** - Logout before updating access tokens
- **Multi-Registry** - Use `--all` for comprehensive cleanup

**Integration with Other Commands:**
```bash
# Complete registry workflow
dlogin ghcr.io                      # Login to registry
dpublish myapp:latest ghcr.io/user/myapp  # Push images
dlogout ghcr.io                     # Logout for security
```

**Related Commands:** `dlogin` (registry authentication), `dpublish` (image publishing), `dpull` (authenticated pulls)  
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
