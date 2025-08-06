# Docker MCP Server

A Model Context Protocol (MCP) server that provides comprehensive Docker operations through a simple interface. This server exposes 13 Docker tools and includes a powerful CLI wrapper with 20+ convenient aliases.

## 🚀 Features

- **13 Docker Tools**: Complete Docker operations via MCP protocol
- **CLI Wrapper**: Easy-to-use command-line interface with aliases
- **Bin Scripts**: Individual scripts for each Docker operation
- **TypeScript**: Fully typed with ES modules support
- **Error Handling**: Robust error handling and timeout protection

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Docker installed and running
- TypeScript (for development)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd docker-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Test the server
npm run start
```

### Global Installation
```bash
# Install globally for CLI access
npm install -g .

# Or link for development
npm link
```

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
Each Docker operation has its own executable script:

#### Basic Operations
```bash
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
# Test CLI wrapper
docker-mcp-server help

# Test basic operations
dimages
dps

# Test advanced operations  
dnetwork list
dvolume list

# Test MCP server
npm run start
```

### Example Workflows
```bash
# Development workflow
dbuild ./app --tag=myapp      # Build image
drun myapp -p 3000:3000       # Run container
dlogs myapp                   # Check logs
dexec myapp bash              # Debug container

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

## 📄 License

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
- Check the Docker daemon is running
- Verify Node.js version (18+)
- Test with `docker version` command
- Review error logs in terminal output

---

**Note**: This MCP server follows the exact pattern of the GitHub MCP server, providing a clean and consistent interface for Docker operations through the Model Context Protocol.
