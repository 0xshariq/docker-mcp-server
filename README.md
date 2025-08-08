# Docker MCP Server

A comprehensive Model Context Protocol (MCP) server that provides advanced Docker operations through a unified interface. This server combines 16 powerful Docker MCP tools with 25+ convenient CLI aliases to create a complete Docker workflow solution for developers, DevOps engineers, and system administrators.

## 🌟 What Makes Docker MCP Server Special

Docker MCP Server is not just another Docker wrapper - it's a complete Docker workflow enhancement system designed to make Docker operations more intuitive, secure, and efficient:

### 🎯 **Unified Interface**
- **MCP Protocol Integration**: Seamlessly works with MCP-compatible tools and IDEs
- **CLI Convenience**: 25+ carefully crafted aliases for common Docker workflows
- **Consistent API**: All operations follow the same patterns and conventions
- **Cross-Platform**: Full support for Linux, macOS, and Windows environments

### 🔒 **Security-First Design**
- **Docker-Managed Security**: All password operations handled by Docker daemon for maximum security
- **Zero Password Exposure**: Passwords never appear in command history, process lists, or arguments
- **Token Authentication Support**: Full support for Personal Access Tokens and service accounts
- **Registry Flexibility**: Secure login to Docker Hub, AWS ECR, Azure ACR, Google GCR, and custom registries
- **CI/CD Security**: Secure stdin password input for automated deployment pipelines
- **Permission Management**: Proper handling of Docker daemon permissions and credential storage

### 🚀 **Developer Experience**
- **Comprehensive Help System**: Every command includes detailed documentation with `--help`
- **Smart Defaults**: Sensible default configurations for common use cases
- **Error Prevention**: Built-in safety checks and confirmation prompts for destructive operations
- **Rich Output**: Formatted, colored output with clear status indicators

### 📊 **Advanced Operations**
- **Complete Container Lifecycle**: From build to publish with comprehensive registry support
- **Multi-Container Management**: Docker Compose integration with service orchestration
- **Registry Publishing**: Advanced image publishing with multi-platform support and automated workflows
- **Network & Volume Management**: Advanced networking and storage operations
- **System Maintenance**: Intelligent cleanup tools with multiple safety levels
- **Development Workflows**: Specialized commands for development environments

## 📦 Installation

### NPM Package Installation (Recommended)

Install Docker MCP Server as a global npm package for system-wide access:

```bash
# Install globally via npm
npm install -g @0xshariq/docker-mcp-server

# Install globally via pnpm (faster)
pnpm add -g @0xshariq/docker-mcp-server

# Install globally via yarn
yarn global add @0xshariq/docker-mcp-server

# Verify installation
@0xshariq/docker-mcp-server --version
```

After global installation, all CLI aliases will be available in your PATH:
```bash
# Use anywhere in your system
drun nginx                    # Run nginx container
dbuild -t myapp .            # Build image from current directory
dps                          # List running containers
dcompose up -d               # Start compose services in background
```

### Development Installation

For development or customization:

```bash
# Clone the repository
git clone https://github.com/yourusername/docker-mcp-server.git
cd docker-mcp-server

# Install dependencies
npm install
# or
pnpm install

# Make CLI aliases executable (Linux/macOS)
chmod +x bin/basic/*
chmod +x bin/advanced/*

# Link for local development
npm link
```

### Prerequisites

Ensure you have the following installed before using Docker MCP Server:

```bash
# Check Node.js version (18+ required)
node --version

# Check Docker installation and daemon status
docker version
docker info

# Check package manager
npm --version
# or
pnpm --version
```

## 🎯 Getting Started

### Quick Start Guide

1. **Install the package:**
   ```bash
   npm install -g docker-mcp-server
   ```

2. **Verify installation:**
   ```bash
   dlist --help                 # Show comprehensive command list
   docker-mcp-server --version  # Check version
   ```

3. **Try basic operations:**
   ```bash
   # Pull and run a container
   dpull nginx
   drun -d -p 8080:80 nginx
   
   # Check running containers
   dps
   
   # View logs
   dlogs <container-name>
   ```

4. **Explore advanced features:**
   ```bash
   # Docker Compose operations
   dcompose up -d               # Start services
   ddown                        # Stop and remove services
   
   # Network management
   dnetwork create mynet        # Create custom network
   dbridge inspect mynet        # Inspect bridge network
   
   # System maintenance
   dclean --dry-run             # Preview cleanup
   dprune images --help         # Learn about image cleanup
   ```

### MCP Server Integration

If you're using an MCP-compatible environment:

```bash
# Start MCP server
node docker-cli.js --mcp-server

# Configure in your MCP client with:
# Command: node
# Args: ["/path/to/docker-mcp-server/docker-cli.js", "--mcp-server"]
```
# Clone the repository
git clone <repository-url>
cd docker-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Install globally to enable CLI aliases everywhere
npm install -g .

# 💡 After global installation, all 25 CLI aliases work from any directory!
```

For detailed installation instructions including troubleshooting, see the [Installation Guide](docs/installation-guide.md).

### Development Installation
```bash
# For development with hot-reload
npm run dev

# Or build and test locally
npm run build
npm run start
```

### Verify Installation
```bash
# Test the CLI aliases work globally
dimages
dps
dlist

# Test the main CLI
docker-mcp-server help
dms help
```

## 🔧 MCP Server Setup

### For Claude Desktop

1. **Locate Claude Desktop Config**:
   - **Linux**: `~/.config/claude-desktop/claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add Docker MCP Server**:
   ```json
   {
     "mcpServers": {
       "docker": {
         "command": "node",
         "args": ["/path/to/docker-mcp-server/dist/index.js"],
         "cwd": "/path/to/docker-mcp-server"
       }
     }
   }
   ```

3. **For Global Installation**:
   ```json
   {
     "mcpServers": {
       "docker": {
         "command": "docker-mcp-server",
         "args": []
       }
     }
   }
   ```

4. **Restart Claude Desktop** to load the MCP server.

### For Other MCP Clients

The server can be used with any MCP-compatible client by connecting to:
- **Command**: `node dist/index.js` (local) or `docker-mcp-server` (global)
- **Protocol**: Model Context Protocol (stdio transport)
- **Working Directory**: Project root directory

## 🛠️ Usage

### MCP Server
The server runs as a Model Context Protocol server, exposing Docker operations to MCP clients:

```bash
# Start the MCP server
npm run start

# Start with inspector for debugging
npm run inspect
```

### Universal Startup Script
For MCP client integration, use the universal startup script that handles environment setup automatically:

```bash
# Universal startup script (recommended for MCP clients)
./start-mcp.sh                  # Start with automatic environment setup
./start-mcp.sh --verbose        # Start with verbose logging
./start-mcp.sh --dev            # Start in development mode
./start-mcp.sh --help           # Show all options

# Compatible with all MCP clients:
# - Claude Desktop (Anthropic)
# - Cursor IDE 
# - Continue (VS Code Extension)
# - Open WebUI
# - Any MCP-compatible client
```

The startup script automatically:
- ✅ Sets up Node.js environment with fnm
- ✅ Validates Docker daemon connectivity  
- ✅ Builds the project if needed
- ✅ Handles environment variables
- ✅ Provides detailed logging

### CLI Wrapper
Use the comprehensive CLI wrapper for quick Docker operations:

```bash
# Show help and available commands
docker-mcp-server help

# Or use the short alias
dms help
```

### Individual Bin Scripts
Each Docker operation has its own executable script (available globally after installation):

#### 🔥 Quick Start Examples
```bash
# Show all available tools and examples
dlist                           # Complete tools overview

# Basic container operations
dimages                         # List images
dps                            # Running containers  
drun -it --rm ubuntu bash      # Interactive container
dlogs -f webapp                # Follow logs

# Advanced operations
dcompose up -d                 # Start services
dbridge create mynet           # Create bridge network
dprune deep -f                 # Deep cleanup
```

For comprehensive examples and workflows, see:
- **[Basic Operations Guide](bin/basic/README.md)** - 8 basic Docker aliases with full documentation
- **[Advanced Operations Guide](bin/advanced/README.md)** - 16 advanced Docker aliases with detailed examples

## 🏗️ Architecture

### Project Structure
```
docker-mcp-server/
├── src/
│   ├── index.ts          # MCP server entry point
│   └── docker.ts         # Docker operations module
├── bin/
│   ├── docker-mcp-helper.js  # Shared utility for bin scripts
│   ├── basic/            # Basic Docker operation scripts
│   │   ├── dimages.js
│   │   ├── dps.js
│   │   ├── dpsa.js
│   │   ├── dpull.js
│   │   ├── drun.js
│   │   ├── dlogs.js
│   │   ├── dexec.js
│   │   └── dbuild.js
│   └── advanced/         # Advanced Docker operation scripts
│       ├── dcompose.js
│       ├── dup.js
│       ├── ddown.js
│       ├── dnetwork.js
│       ├── dvolume.js
│       ├── dinspect.js
│       ├── dprune.js
│       ├── dlogin.js
│       ├── dpublish.js   # NEW: Image publishing to registries
│       ├── ddev.js
│       ├── dclean.js
│       ├── dstop.js
│       └── dreset.js
├── help/                 # JSON help files for all commands
│   ├── basic/
│   └── advanced/
├── docker-cli.js         # Main CLI wrapper
├── start-mcp.sh          # Universal MCP server startup script
├── dist/                 # Compiled TypeScript output
├── package.json
├── tsconfig.json
└── README.md
```

### MCP Tools Available

| Tool | Category | Description |
|------|----------|-------------|
| `docker-images` | Basic | List Docker images |
| `docker-containers` | Basic | List Docker containers |
| `docker-pull` | Basic | Pull Docker images |
| `docker-run` | Basic | Run Docker containers |
| `docker-logs` | Basic | View container logs |
| `docker-exec` | Basic | Execute commands in containers |
| `docker-build` | Basic | Build Docker images |
| `docker-compose` | Advanced | Docker Compose operations |
| `docker-network` | Advanced | Manage Docker networks |
| `docker-volume` | Advanced | Manage Docker volumes |
| `docker-inspect` | Advanced | Inspect Docker objects |
| `docker-prune` | Advanced | Clean up unused resources |
| `docker-login` | Advanced | Login to Docker registries |
| `docker-logout` | Advanced | Logout from Docker registries |
| `docker-list` | Utility | List all available Docker tools and aliases |

## 📋 CLI Aliases

### Available Aliases
The package provides 25 CLI aliases organized into basic and advanced operations:

| Alias | Command | Description |
|-------|---------|-------------|
| `docker-mcp-server` | Main CLI | Full CLI wrapper |
| `dms` | Alias | Short alias for CLI |
| **Basic Operations (8)** | | |
| `dimages` | bin/basic/dimages.js | List Docker images |
| `dps` | bin/basic/dps.js | List running containers |
| `dpsa` | bin/basic/dpsa.js | List all containers |
| `dpull` | bin/basic/dpull.js | Pull Docker images |
| `drun` | bin/basic/drun.js | Run containers with full options |
| `dlogs` | bin/basic/dlogs.js | View container logs |
| `dexec` | bin/basic/dexec.js | Execute commands in containers |
| `dbuild` | bin/basic/dbuild.js | Build Docker images |
| **Advanced Operations (14)** | | |
| `dcompose` | bin/advanced/dcompose.js | Docker Compose operations |
| `dup` | bin/advanced/dup.js | Quick compose up |
| `ddown` | bin/advanced/ddown.js | Quick compose down |
| `dnetwork` | bin/advanced/dnetwork.js | Network management |
| `dvolume` | bin/advanced/dvolume.js | Volume management |
| `dinspect` | bin/advanced/dinspect.js | Inspect Docker objects |
| `dprune` | bin/advanced/dprune.js | System cleanup operations |
| `dlogin` | bin/advanced/dlogin.js | Secure registry login |
| `dlogout` | bin/advanced/dlogout.js | Registry logout |
| `dpublish` | bin/advanced/dpublish.js | Publish images to registries |
| `dbridge` | bin/advanced/dbridge.js | Bridge network management |
| `ddev` | bin/advanced/ddev.js | Development workflows |
| `dclean` | bin/advanced/dclean.js | Comprehensive system cleanup |
| `dstop` | bin/advanced/dstop.js | Advanced container stopping |
| `dreset` | bin/advanced/dreset.js | Environment reset |
| **Utility (3)** | | |
| `dlist` | bin/advanced/dlist.js | List all tools and aliases |

### Documentation Links
- **[Basic Operations](bin/basic/README.md)** - Detailed documentation for all 8 basic aliases
- **[Advanced Operations](bin/advanced/README.md)** - Comprehensive guide for all 13 advanced aliases
- **[Command Reference](docs/commands.md)** - Complete syntax and options reference

## 🔧 Development

### Scripts
```bash
# Build TypeScript
npm run build

# Start the MCP server
npm run start

# Development mode (watch + restart)
npm run dev

# Build and start
npm run dev:build

# Debug with MCP inspector
npm run inspect

# Clean build artifacts
npm run clean

# Test CLI
npm run cli
npm run cli:help

# Install globally for system-wide access
npm run install:global

# Uninstall global installation
npm run uninstall:global
```

### TypeScript Configuration
The project uses ES2022 target with ESNext modules for modern Node.js compatibility:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## 🧪 Testing

### Verify Installation
```bash
# Test global CLI installation
which docker-mcp-server
which dimages
which dlist

# Test CLI wrapper
docker-mcp-server help
dms help

# Test basic operations
dimages
dps
dlist

# Test advanced operations  
dnetwork list
dvolume list

# Test MCP server
npm run start
```

### Verify MCP Server in Claude Desktop
1. Restart Claude Desktop after configuration
2. Look for Docker tools in the MCP section
3. Try asking Claude: "List my Docker containers"
4. Verify all 14 tools are available

### Example Workflows
```bash
# Development workflow
dbuild ./app --tag=myapp      # Build image
drun myapp -p 3000:3000       # Run container
dlogs myapp                   # Check logs
dexec myapp bash              # Debug container

# Information gathering
dlist                         # List all available commands
dimages                       # See available images
dps                           # Check running containers

# Cleanup workflow
dstop all                     # Stop all containers
dprune containers            # Remove stopped containers
dprune images                # Remove unused images
dclean deep                  # Deep cleanup
```

## 🔒 Security Notes

- The server executes Docker commands with the same permissions as the running user
- Ensure proper Docker daemon security configuration
- Consider running in restricted environments for production use
- All Docker operations have timeout protection (30 seconds default)

## � Troubleshooting

### Common Issues

#### 1. "Command not found" after global installation
```bash
# Verify npm global bin path is in PATH
npm config get prefix
echo $PATH

# If missing, add to your shell profile (.bashrc, .zshrc, etc.):
export PATH="$(npm config get prefix)/bin:$PATH"

# Reload shell or run:
source ~/.bashrc  # or ~/.zshrc
```

#### 2. Docker daemon not running
```bash
# Check Docker status
docker version
docker info

# Start Docker daemon (Linux)
sudo systemctl start docker

# Start Docker Desktop (macOS/Windows)
# Launch Docker Desktop application
```

#### 3. Permission denied errors
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
# Then logout and login again

# Or run with sudo (not recommended)
sudo dimages
```

#### 4. MCP Server not appearing in Claude Desktop
```bash
# Check config file location and syntax
# Linux: ~/.config/claude-desktop/claude_desktop_config.json
# macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# Windows: %APPDATA%\Claude\claude_desktop_config.json

# Verify JSON syntax:
cat ~/.config/claude-desktop/claude_desktop_config.json | jq .

# Check server can start:
node dist/index.js

# Restart Claude Desktop completely
```

#### 5. Build errors
```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules dist
npm install
npm run build

# Check Node.js version
node --version  # Should be 18+
```

#### 6. TypeScript compilation errors
```bash
# Check TypeScript installation
npx tsc --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for conflicting TypeScript versions
npm list typescript
```

### Platform-Specific Notes

#### Linux
- Ensure Docker daemon is running: `sudo systemctl status docker`
- Add user to docker group to avoid sudo: `sudo usermod -aG docker $USER`
- PATH issues: Add npm global bin to PATH in `.bashrc` or `.zshrc`

#### macOS
- Install Docker Desktop from official website
- Ensure Docker Desktop is running before using tools
- Use Homebrew for Node.js: `brew install node`

#### Windows
- Install Docker Desktop for Windows
- Use PowerShell or Command Prompt
- Ensure Windows Subsystem for Linux (WSL2) is configured for Docker
- Use Windows Terminal for better command-line experience

### Getting Help

1. **Check Docker Status**: `docker version && docker info`
2. **Verify Installation**: `which docker-mcp-server && dlist`
3. **Check Logs**: Run commands with `--verbose` or check terminal output
4. **Test MCP Server**: `npm run start` to see if server starts properly
5. **Validate Configuration**: Ensure Claude Desktop config is valid JSON

If problems persist, please create an issue with:
- Operating system and version
- Node.js version (`node --version`)
- Docker version (`docker --version`)
- Complete error message
- Steps to reproduce

## �📄 License

ISC License

## 👨‍💻 Author

Sharique Chaudhary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## 📞 Support

For issues and questions:

### Quick Diagnostics
```bash
# Basic system check
node --version                    # Should be 18+
docker --version                  # Verify Docker installed
docker info                       # Check Docker daemon
which docker-mcp-server          # Verify global installation
dlist                            # Test basic functionality
```

### Common Solutions
- **Docker daemon issues**: Ensure Docker is running (`docker info`)
- **Permission errors**: Add user to docker group (Linux) or check Docker Desktop (macOS/Windows)
- **Command not found**: Verify npm global bin path is in your shell's PATH
- **MCP not working**: Check Claude Desktop config file syntax and restart the application
- **Build errors**: Clear cache with `npm run clean` and rebuild

### Reporting Issues
When reporting bugs, please include:
- Operating system and version
- Node.js version output
- Docker version output  
- Complete error message
- Steps to reproduce the issue

---

**Note**: This MCP server follows the Model Context Protocol specification and provides a comprehensive Docker interface compatible with Claude Desktop and other MCP clients.
