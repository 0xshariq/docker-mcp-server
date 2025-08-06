# Docker MCP Server

A Model Context Protocol (MCP) server that provides comprehensive Docker operations through a simple interface. This server exposes 14 Docker tools and includes a powerful CLI wrapper with 22+ convenient aliases.

## 🚀 Features

- **14 Docker Tools**: Complete Docker operations via MCP protocol including docker-list
- **CLI Wrapper**: Easy-to-use command-line interface with aliases
- **22 Bin Scripts**: Individual executable scripts for each Docker operation
- **Global Installation**: Install globally for system-wide CLI access
- **TypeScript**: Fully typed with ES modules support
- **Error Handling**: Robust error handling and timeout protection
- **Cross-Platform**: Works on Linux, macOS, and Windows

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Docker installed and running
- npm or pnpm package manager
- TypeScript (for development)

### Quick Installation
```bash
# Clone the repository
git clone <repository-url>
cd docker-mcp-server

# Install dependencies
npm install
# or
pnpm install

# Build the project
npm run build

# Install globally for CLI access everywhere
npm run install:global
# or
npm install -g .
```

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

#### Basic Operations
```bash
# List all available tools
dlist                  # Show all Docker tools and aliases

# List Docker images
dimages

# List running containers  
dps

# List all containers (including stopped)
dpsa

# Pull an image
dpull nginx

# Run a container
drun nginx -p 80:80

# View container logs
dlogs mycontainer

# Execute command in container
dexec mycontainer bash

# Build an image
dbuild ./app --tag=myapp
```

#### Advanced Operations
```bash
# Docker Compose operations
dcompose up
dup                    # Alias for compose up
ddown                  # Alias for compose down

# Network management
dnetwork list
dnetwork create mynet
dnetwork remove mynet

# Volume management  
dvolume list
dvolume create myvol
dvolume remove myvol

# Inspect resources
dinspect container myapp
dinspect image nginx
dinspect network mynet

# Cleanup operations
dprune containers      # Remove stopped containers
dprune images         # Remove unused images  
dprune all           # Remove all unused resources

# Registry operations
dlogin                # Login to Docker Hub
dlogin myregistry.com # Login to custom registry

# Development workflows
ddev start            # Start dev containers
ddev shell myapp      # Open shell in container

# System cleanup
dclean light          # Light cleanup
dclean deep           # Deep cleanup
dstop all             # Stop all containers
dreset                # Reset Docker environment
```

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
│       ├── ddev.js
│       ├── dclean.js
│       ├── dstop.js
│       └── dreset.js
├── docker-cli.js         # Main CLI wrapper
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
| `docker-list` | Utility | List all available Docker tools and aliases |

## 📋 CLI Aliases

### Available Aliases
The package provides 22 CLI aliases for quick access:

| Alias | Command | Description |
|-------|---------|-------------|
| `docker-mcp-server` | Main CLI | Full CLI wrapper |
| `dms` | Alias | Short alias for CLI |
| **Basic Operations** | | |
| `dimages` | bin/basic/dimages.js | List images |
| `dps` | bin/basic/dps.js | List running containers |
| `dpsa` | bin/basic/dpsa.js | List all containers |
| `dpull` | bin/basic/dpull.js | Pull images |
| `drun` | bin/basic/drun.js | Run containers |
| `dlogs` | bin/basic/dlogs.js | View logs |
| `dexec` | bin/basic/dexec.js | Execute commands |
| `dbuild` | bin/basic/dbuild.js | Build images |
| **Advanced Operations** | | |
| `dcompose` | bin/advanced/dcompose.js | Compose operations |
| `dup` | bin/advanced/dup.js | Compose up |
| `ddown` | bin/advanced/ddown.js | Compose down |
| `dnetwork` | bin/advanced/dnetwork.js | Network management |
| `dvolume` | bin/advanced/dvolume.js | Volume management |
| `dinspect` | bin/advanced/dinspect.js | Inspect resources |
| `dprune` | bin/advanced/dprune.js | Cleanup operations |
| `dlogin` | bin/advanced/dlogin.js | Registry login |
| `ddev` | bin/advanced/ddev.js | Development workflows |
| `dclean` | bin/advanced/dclean.js | System cleanup |
| `dstop` | bin/advanced/dstop.js | Stop containers |
| `dreset` | bin/advanced/dreset.js | Reset environment |
| **Utility** | | |
| `dlist` | bin/advanced/dlist.js | List all tools and aliases |

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
