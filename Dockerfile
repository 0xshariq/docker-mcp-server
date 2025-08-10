# Docker MCP Server - Docker Build
# This Dockerfile creates an optimized container for the Docker MCP Server
# using the published npm package for easy deployment

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies and Docker
RUN apk add --no-cache \
    docker-cli \
    docker-compose \
    git \
    openssh-client \
    ca-certificates \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Install the published npm package globally
RUN npm install -g @0xshariq/docker-mcp-server@2.0.2

# Create data directory for Docker operations
RUN mkdir -p /app/data && \
    chown mcp:nodejs /app/data

# Create Docker configuration directory
RUN mkdir -p /home/mcp/.docker && \
    chown mcp:nodejs /home/mcp/.docker

# Set Docker environment variables
ENV DOCKER_HOST=unix:///var/run/docker.sock
ENV DOCKER_BUILDKIT=1

# Expose port for potential HTTP interface
EXPOSE 3000

# Switch to non-root user
USER mcp

# Security settings
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD docker-mcp-server --version || exit 1

# Set default command to start MCP server
CMD ["docker-mcp-server"]

# Metadata labels
LABEL \
    org.opencontainers.image.title="Docker MCP Server" \
    org.opencontainers.image.description="Enhanced Docker workflow management through MCP with 8 basic operations, 19 advanced workflows, and comprehensive container management" \
    org.opencontainers.image.version="2.0.4" \
    org.opencontainers.image.authors="Sharique Chaudhary" \
    org.opencontainers.image.source="https://github.com/0xshariq/docker-mcp-server" \
    org.opencontainers.image.licenses="ISC" \
    org.opencontainers.image.documentation="https://github.com/0xshariq/docker-mcp-server/blob/main/README.md" \
    org.opencontainers.image.url="https://www.npmjs.com/package/@0xshariq/docker-mcp-server"
