# Installation Guide

This guide provides detailed instructions for installing and setting up the Docker MCP (Model Context Protocol) Server with CLI aliases.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
  - [NPM Package Installation](#npm-package-installation-recommended)
  - [Global Installation from Source](#global-installation-from-source)
  - [Local Development Installation](#local-development-installation)
- [Verification](#verification)
- [Configuration](#configuration)
- [Updating](#updating)
- [Troubleshooting](#troubleshooting)
- [Uninstallation](#uninstallation)

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Docker**: Latest stable version
- **Operating System**: Linux, macOS, or Windows (with WSL2)

### Verify Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Docker version
docker --version

# Verify Docker is running
docker info
```

## Installation Methods

### NPM Package Installation (Recommended)

Install Docker MCP Server as a global npm package:

```bash
# Install from npm (recommended)
npm install -g docker-mcp-server

# Alternative: Install using pnpm
pnpm add -g docker-mcp-server

# Alternative: Install using yarn
yarn global add docker-mcp-server

# Test the installation
dps --help
```

After global npm installation, all CLI aliases will be available in your PATH:
- `drun`, `dbuild`, `dimages`, `dps`, etc. (basic commands)
- `dcompose`, `dnetwork`, `dvolume`, `dprune`, etc. (advanced commands)

### Global Installation from Source

This method installs from the source repository:

```bash
# Clone the repository
git clone https://github.com/0xshariq/docker-mcp-server.git
cd docker-mcp-server

# Install dependencies
npm install

# Install globally to enable CLI aliases
npm install -g .
```

### Method 2: Local Development Installation

For development or testing purposes, you can install locally:

```bash
# Clone the repository
git clone https://github.com/0xshariq/docker-mcp-server.git
cd docker-mcp-server

# Install dependencies
npm install

# Link locally for development
npm link
```

### Method 3: Direct npm Installation

Once published to npm registry:

```bash
# Install directly from npm
npm install -g docker-mcp-server
```

## Global Installation Details

After running `npm install -g .`, the following CLI aliases become available:

### Basic Operations (8 aliases)
- `dimages` - List Docker images
- `dps` - List running containers
- `dpsa` - List all containers
- `dpull` - Pull Docker images
- `drun` - Run containers with full options
- `dlogs` - View container logs
- `dexec` - Execute commands in containers
- `dbuild` - Build Docker images

### Advanced Operations (13 aliases)
- `dcompose` - Docker Compose operations
- `dup` - Quick compose up

- `ddown` - Quick compose down
- `dnetwork` - Network management
- `dvolume` - Volume management
- `dinspect` - Inspect Docker objects
- `dprune` - System cleanup
- `dlogin` - Registry login
- `dlogout` - Registry logout
- `dbridge` - Bridge network management
- `ddev` - Development workflows
- `dclean` - Comprehensive cleanup
- `dstop` - Advanced container stopping
- `dreset` - Environment reset
- `dlist` - Tools and aliases reference

## Verification

### Test Basic Commands

```bash
# Test basic aliases
dimages                         # Should list Docker images
dps                            # Should list running containers
dlist                          # Should show all available tools

# Test MCP server functionality
docker-mcp-server --help       # Should show MCP server options
```

### Test Advanced Commands

```bash
# Test network management
dnetwork list                   # Should list Docker networks

# Test volume management
dvolume list                    # Should list Docker volumes

# Test system information
dinspect container <container>  # Should show container details
```

### Verify MCP Server

```bash
# Start MCP server in test mode
npx @modelcontextprotocol/cli test docker-mcp-server

# Or start server directly
docker-mcp-server --stdio
```

## Configuration

### Environment Variables

Create a `.env` file in your home directory or project root:

```bash
# Docker configuration
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_BUILDKIT=1

# MCP server configuration
MCP_SERVER_PORT=3000
MCP_SERVER_HOST=localhost

# Registry configuration
DOCKER_REGISTRY=https://index.docker.io/v1/
DOCKER_USERNAME=your-username
```

### Docker Configuration

Ensure Docker daemon is properly configured:

```bash
# Check Docker daemon configuration
docker system info

# Configure Docker to start on boot (Linux)
sudo systemctl enable docker

# Add user to docker group (Linux)
sudo usermod -aG docker $USER
# Logout and login again for group changes to take effect
```

### Shell Configuration

Add aliases to your shell configuration for enhanced functionality:

```bash
# For Bash (~/.bashrc)
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# For Zsh (~/.zshrc)
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# For Fish (~/.config/fish/config.fish)
echo 'set -gx PATH $HOME/.npm-global/bin $PATH' >> ~/.config/fish/config.fish
```

## Updating

### Update Global Installation

```bash
# Navigate to the project directory
cd docker-mcp-server

# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Reinstall globally
npm install -g .
```

### Update npm Package

```bash
# Update to latest version
npm update -g docker-mcp-server

# Or reinstall
npm uninstall -g docker-mcp-server
npm install -g docker-mcp-server
```

## Troubleshooting

### Common Issues

#### 1. Command Not Found

```bash
# Error: command not found: dimages
# Solution: Verify global installation path
npm list -g --depth=0
npm config get prefix

# Add npm global path to PATH
export PATH="$(npm config get prefix)/bin:$PATH"
```

#### 2. Permission Errors

```bash
# Error: EACCES permission denied
# Solution: Configure npm global directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### 3. Docker Connection Issues

```bash
# Error: Cannot connect to Docker daemon
# Solution: Check Docker service
sudo systemctl status docker
sudo systemctl start docker

# Check Docker socket permissions
ls -la /var/run/docker.sock
sudo chmod 666 /var/run/docker.sock
```

#### 4. MCP Server Issues

```bash
# Error: MCP server fails to start
# Solution: Check Node.js version and dependencies
node --version
npm list

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Set debug environment variable
export DEBUG=docker-mcp-server:*

# Run commands with debug output
DEBUG=docker-mcp-server:* dimages

# Start MCP server with debug logging
DEBUG=docker-mcp-server:* docker-mcp-server --stdio
```

### Log Files

Check log files for detailed error information:

```bash
# MCP server logs (if configured)
tail -f ~/.docker-mcp-server/logs/server.log

# System logs (Linux)
journalctl -u docker -f

# Docker daemon logs
docker system events
```

## Uninstallation

### Remove Global Installation

```bash
# Uninstall global package
npm uninstall -g docker-mcp-server

# Or if installed from source
npm uninstall -g /path/to/docker-mcp-server

# Clean npm cache
npm cache clean --force
```

### Remove Local Installation

```bash
# Unlink local installation
npm unlink

# Remove project directory
rm -rf docker-mcp-server
```

### Clean Configuration

```bash
# Remove configuration files
rm -rf ~/.docker-mcp-server
rm ~/.env

# Remove from shell configuration
# Edit ~/.bashrc, ~/.zshrc, or ~/.config/fish/config.fish
# Remove PATH additions and aliases
```

## Platform-Specific Instructions

### Linux

```bash
# Ubuntu/Debian additional dependencies
sudo apt update
sudo apt install -y curl git

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### macOS

```bash
# Install via Homebrew
brew install node npm
brew install docker

# Or install Docker Desktop
# Download from https://docs.docker.com/desktop/mac/install/
```

### Windows (WSL2)

```bash
# Install Node.js in WSL2
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker Desktop for Windows with WSL2 backend
# Download from https://docs.docker.com/desktop/windows/install/

# Configure WSL2 integration
# Enable WSL2 integration in Docker Desktop settings
```

## Security Considerations

1. **Docker Socket Access**: Ensure proper permissions on Docker socket
2. **Registry Authentication**: Store credentials securely
3. **Network Security**: Configure Docker networks appropriately
4. **User Permissions**: Run with minimal required permissions
5. **Updates**: Keep Docker and Node.js updated

## Support

For additional help:

1. **Documentation**: [Command Reference](./commands.md)
2. **GitHub Issues**: Report issues on GitHub repository
3. **Docker Documentation**: [Official Docker Docs](https://docs.docker.com/)
4. **MCP Documentation**: [Model Context Protocol](https://modelcontextprotocol.ai/)

## Next Steps

After successful installation:

1. Read the [Command Reference](./commands.md)
2. Check [Basic Operations Guide](../bin/basic/README.md)
3. Learn [Advanced Operations](../bin/advanced/README.md)
4. Start using Docker with enhanced CLI aliases!
