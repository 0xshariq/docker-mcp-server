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

### Simple Installation (Recommended)

Install Docker MCP Server globally to use it anywhere on your system:

```bash
# Install with npm
npm install -g @0xshariq/docker-mcp-server

# Or install with pnpm (faster)
pnpm add -g @0xshariq/docker-mcp-server

# Verify installation works
docker-mcp-server --version
dlist                        # List all available commands
```

That's it! All 25 CLI aliases are now available system-wide.

### For Developers

If you want to contribute or customize the server:

```bash
# Clone and setup
git clone https://github.com/0xshariq/docker-mcp-server.git
cd docker-mcp-server
npm install
npm run build

# Test locally
npm link                     # Makes commands available globally
dlist                       # Verify it works
```

### What You Need First

Before installing, make sure you have:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker** - [Install Docker](https://docs.docker.com/get-docker/)
- **npm** (comes with Node.js)

Check if you have them:
```bash
node --version              # Should show v18 or higher
docker --version           # Should show Docker version
```

## 🚀 Quick Start

### Try It Out
Once installed, try these commands to see Docker MCP Server in action:

```bash
# See all available commands
dlist

# Basic Docker operations
dps                         # List running containers
dimages                     # List Docker images
drun -it ubuntu bash        # Run interactive Ubuntu container

# Advanced operations
dcompose up -d              # Start Docker Compose services
dlogin                      # Login to Docker registries
dpublish myapp:v1.0         # Publish image to registry
```

### 📚 Documentation

**Learn More:**
- **[📖 Basic Commands](bin/basic/README.md)** - 8 essential Docker operations made simple
- **[⚡ Advanced Commands](bin/advanced/README.md)** - 14 powerful tools for complex workflows
- **[🔧 MCP Server Setup](docs/mcp-setup.md)** - Connect with Claude Desktop and other MCP clients

## 🎯 What You Get

### Basic Commands (8 aliases)
Simple, everyday Docker operations that just work:
- **Container Management**: List, run, stop, and inspect containers
- **Image Operations**: Pull, build, and manage Docker images  
- **Logs & Debugging**: View logs and execute commands inside containers

### Advanced Commands (14 aliases)
Powerful tools for complex Docker workflows:
- **Multi-Container Apps**: Full Docker Compose integration
- **Registry Operations**: Secure login and image publishing to Docker Hub, GitHub, AWS, etc.
- **Network & Storage**: Advanced networking and volume management
- **System Maintenance**: Intelligent cleanup and environment management
- **Development Tools**: Specialized workflows for development environments

## 🔧 MCP Server Setup

### For Claude Desktop
1. **Find your Claude config file:**
   - **Linux**: `~/.config/claude-desktop/claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add this to your config:**
   ```json
   {
     "mcpServers": {
       "docker": {
         "command": "node",
         "args": ["/path/to/docker-mcp-server/dist/index.js"]
       }
     }
   }
   ```

3. **Restart Claude Desktop** and you'll see Docker tools available!

### Universal Startup Script
Use our startup script for automatic setup with any MCP client:

```bash
./start-mcp.sh              # Automatic environment setup
./start-mcp.sh --help       # See all options
```

**Compatible with:** Claude Desktop, Cursor IDE, Continue (VS Code), Open WebUI, and more!

## 🏗️ Project Structure

```
docker-mcp-server/
├── src/                    # TypeScript source code
├── bin/                    # CLI alias scripts
│   ├── basic/             # 8 basic Docker operations
│   └── advanced/          # 14 advanced Docker operations  
├── help/                  # Documentation for all commands
├── start-mcp.sh          # Universal MCP server startup script
├── docker-cli.js         # Main CLI wrapper
└── dist/                 # Compiled JavaScript output
```

**📚 Complete Documentation:**
- **[Basic Commands Reference](bin/basic/README.md)** - 8 essential Docker operations
- **[Advanced Commands Reference](bin/advanced/README.md)** - 14 powerful workflow tools
- **[All Available Commands](docs/commands.md)** - Complete syntax and examples

## ⚡ All Available Commands

### Basic Operations (8 commands)
Essential Docker operations for daily use:
- `dimages`, `dps`, `dpsa`, `dpull`, `drun`, `dlogs`, `dexec`, `dbuild`

### Advanced Operations (14 commands)  
Powerful tools for complex workflows:
- `dcompose`, `dup`, `ddown`, `dnetwork`, `dvolume`, `dinspect`, `dprune`
- `dlogin`, `dlogout`, `dpublish`, `dbridge`, `ddev`, `dclean`, `dstop`, `dreset`

### Utility Commands (3 commands)
- `docker-mcp-server`, `dms`, `dlist`

**📖 See detailed documentation:** Use `dlist` command or check the README files linked above.

## 🔧 Development

### For Contributors
```bash
# Setup development environment
git clone https://github.com/0xshariq/docker-mcp-server.git
cd docker-mcp-server
npm install

# Development commands
npm run dev                 # Build and watch for changes
npm run build              # Build TypeScript
npm run start              # Start MCP server
npm run clean              # Clean build files
```

## 🧪 Testing

### Quick Test
```bash
# After installation, test these commands
dlist                      # Should show all 25 commands
dps                        # Should list containers
dimages                    # Should list images
```

### Test MCP Integration
```bash
./start-mcp.sh             # Should start without errors
```

## 🆘 Common Issues

### "Command not found"
```bash
# Make sure npm global bin is in your PATH
echo $PATH | grep $(npm config get prefix)

# If not found, add this to ~/.bashrc or ~/.zshrc:
export PATH="$(npm config get prefix)/bin:$PATH"
```

### "Docker daemon not running"
```bash
# Check Docker status
docker info

# Start Docker (Linux)
sudo systemctl start docker

# Start Docker Desktop (macOS/Windows)
# Launch the Docker Desktop app
```

### "Permission denied"
```bash
# Add yourself to docker group (Linux)
sudo usermod -aG docker $USER
# Then logout and login again
```

**📋 More Help:** 
- Check `dlist --help` for all commands
- See [Troubleshooting Guide](docs/troubleshooting.md) for detailed solutions

---

## 📄 License

ISC License

## 👨‍💻 Author

**Sharique Chaudhary** ([@0xshariq](https://github.com/0xshariq))

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch  
3. Test your changes
4. Submit a pull request

## 🔗 Links

- **[GitHub Repository](https://github.com/0xshariq/docker-mcp-server)**
- **[NPM Package](https://www.npmjs.com/package/@0xshariq/docker-mcp-server)**
- **[Issues & Support](https://github.com/0xshariq/docker-mcp-server/issues)**

---

**✨ Docker MCP Server** - Making Docker workflows simple and powerful for everyone!
