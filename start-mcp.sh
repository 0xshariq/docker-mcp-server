#!/bin/bash

##############################################################################
# Universal MCP Server Startup Script for Docker MCP Server
# 
# Compatible with:
# - Claude Desktop (Anthropic)
# - Cursor IDE
# - Continue (VS Code Extension)
# - Open WebUI
# - Any MCP-compatible client
#
# This script provides a universal interface for starting the Docker MCP Server
# with proper Node.js environment setup regardless of the calling client.
##############################################################################

# Set script options for better error handling
set -euo pipefail

# === CONFIGURATION ===
PROJECT_DIR="/home/simplysabir/desktop/dev-ecosystem/services/docker-mcp-server"
NODE_VERSION="24.4.1"
SERVER_FILE="src/index.ts"
DIST_FILE="dist/index.js"

# === LOGGING FUNCTIONS ===
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >&2
}

error() {
    log "ERROR: $*"
    exit 1
}

# === ENVIRONMENT SETUP ===
setup_fnm_environment() {
    log "Setting up fnm environment..."
    
    export FNM_PATH="$HOME/.local/share/fnm"
    
    if [ ! -d "$FNM_PATH" ]; then
        error "fnm not found at $FNM_PATH"
    fi
    
    export PATH="$FNM_PATH:$PATH"
    eval "$(fnm env --use-on-cd)"
    
    # Use specific Node.js version
    if ! fnm use "$NODE_VERSION" 2>/dev/null; then
        log "Node.js v$NODE_VERSION not found. Attempting to install..."
        if ! fnm install "$NODE_VERSION"; then
            error "Failed to install Node.js v$NODE_VERSION"
        fi
        fnm use "$NODE_VERSION"
    fi
    
    log "Using Node.js $(node --version)"
}

# === VALIDATION ===
validate_environment() {
    log "Validating environment..."
    
    # Check if we're in the correct directory
    if [ ! -d "$PROJECT_DIR" ]; then
        error "Project directory not found: $PROJECT_DIR"
    fi
    
    cd "$PROJECT_DIR" || error "Cannot change to project directory"
    
    # Check if Node.js is available
    if ! command -v node >/dev/null 2>&1; then
        error "Node.js not found in PATH"
    fi
    
    # Check if Docker is available
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker not found in PATH. Docker is required for this MCP server."
    fi
    
    # Check Docker daemon with auto-start attempt
    if ! docker info >/dev/null 2>&1; then
        log "Docker daemon is not running. Attempting to start Docker..."
        
        # Try different methods to start Docker based on the system
        if command -v systemctl >/dev/null 2>&1; then
            log "Attempting to start Docker via systemctl..."
            if sudo systemctl start docker 2>/dev/null; then
                log "Docker service started successfully via systemctl"
                sleep 3  # Give Docker time to fully initialize
            fi
        elif command -v service >/dev/null 2>&1; then
            log "Attempting to start Docker via service command..."
            if sudo service docker start 2>/dev/null; then
                log "Docker service started successfully via service command"
                sleep 3  # Give Docker time to fully initialize
            fi
        elif command -v brew >/dev/null 2>&1; then
            log "Detected macOS. Please start Docker Desktop manually."
            log "You can start it from Applications or run: open -a Docker"
        fi
        
        # Check again after start attempts
        if ! docker info >/dev/null 2>&1; then
            error "Docker daemon is still not running. Please start Docker manually:
    - Linux: sudo systemctl start docker
    - macOS: Open Docker Desktop from Applications
    - Windows: Start Docker Desktop"
        else
            log "Docker daemon is now running successfully"
        fi
    fi
    
    log "Environment validation completed"
}

# === BUILD CHECK ===
ensure_build() {
    log "Checking build status..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        error "package.json not found"
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log "Installing dependencies..."
        npm install
    fi
    
    # Check if built file exists or source is newer
    if [ ! -f "$DIST_FILE" ] || [ "$SERVER_FILE" -nt "$DIST_FILE" ]; then
        log "Building Docker MCP Server..."
        npm run build
    fi
    
    # Verify the built file exists
    if [ ! -f "$DIST_FILE" ]; then
        error "MCP server build file not found: $DIST_FILE"
    fi
    
    log "Build verification completed"
}

# === MCP SERVER STARTUP ===
start_mcp_server() {
    log "Starting Docker MCP Server..."
    log "Working directory: $(pwd)"
    log "Node.js version: $(node --version)"
    log "npm version: $(npm --version)"
    log "Docker version: $(docker --version)"
    
    # Set environment variables for MCP
    export NODE_ENV=production
    export MCP_SERVER_NAME="docker-mcp-server"
    export MCP_SERVER_VERSION="1.0.0"
    
    # Docker-specific environment variables
    export DOCKER_HOST="${DOCKER_HOST:-unix:///var/run/docker.sock}"
    
    # Add Docker CLI aliases to PATH for development
    export PATH="$PROJECT_DIR/bin/basic:$PROJECT_DIR/bin/advanced:$PATH"
    
    # Start the MCP server
    log "Executing: node $DIST_FILE"
    exec node "$DIST_FILE"
}

# === HELP FUNCTION ===
show_help() {
    cat << EOF
Docker MCP Server Universal Startup Script

USAGE:
    ./start-mcp.sh [OPTIONS]

OPTIONS:
    -h, --help          Show this help message
    -v, --verbose       Enable verbose logging
    --no-build          Skip build check (use existing build)
    --dev               Start in development mode (uses ts-node)

ENVIRONMENT:
    PROJECT_DIR         Project directory (default: $PROJECT_DIR)
    NODE_VERSION        Required Node.js version (default: $NODE_VERSION)
    DOCKER_HOST         Docker daemon socket (default: unix:///var/run/docker.sock)

EXAMPLES:
    ./start-mcp.sh                  # Start with default settings
    ./start-mcp.sh --verbose        # Start with verbose logging
    ./start-mcp.sh --dev            # Start in development mode
    ./start-mcp.sh --no-build       # Skip build check

REQUIREMENTS:
    - Node.js v$NODE_VERSION or compatible
    - Docker daemon running
    - fnm (Fast Node Manager) for Node.js version management

COMPATIBLE WITH:
    - Claude Desktop (Anthropic)
    - Cursor IDE
    - Continue (VS Code Extension)  
    - Open WebUI
    - Any MCP-compatible client

For more information, visit: https://github.com/0xshariq/docker-mcp-server
EOF
}

# === ARGUMENT PARSING ===
VERBOSE=false
NO_BUILD=false
DEV_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --dev)
            DEV_MODE=true
            shift
            ;;
        *)
            error "Unknown option: $1. Use --help for usage information."
            ;;
    esac
done

# === MAIN EXECUTION ===
main() {
    log "=== Docker MCP Server Universal Startup ==="
    log "Compatible with Claude Desktop, Continue, Open WebUI, and other MCP clients"
    
    if [ "$VERBOSE" = true ]; then
        log "Verbose mode enabled"
        set -x
    fi
    
    setup_fnm_environment
    validate_environment
    
    if [ "$DEV_MODE" = true ]; then
        log "Starting in development mode..."
        export NODE_ENV=development
        if ! command -v ts-node >/dev/null 2>&1; then
            log "Installing ts-node for development mode..."
            npm install -g ts-node
        fi
        log "Executing: ts-node $SERVER_FILE"
        exec npx ts-node "$SERVER_FILE"
    else
        if [ "$NO_BUILD" = false ]; then
            ensure_build
        fi
        start_mcp_server
    fi
}

# Run main function
main "$@"
