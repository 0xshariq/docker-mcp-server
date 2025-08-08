# Docker MCP Server - Multi-stage Docker Build
# This Dockerfile creates an optimized container for the Docker MCP Server
# with Docker client capabilities and organized CLI aliases (basic/advanced workflows)

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    docker-cli \
    docker-compose \
    git \
    openssh-client \
    ca-certificates

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile && \
    pnpm store prune

# Copy source code
COPY src/ ./src/
COPY bin/ ./bin/
COPY docker-cli.js ./

# Build the TypeScript project
RUN npm run build

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

# Copy built application from builder stage
COPY --from=builder --chown=mcp:nodejs /app/dist ./dist
COPY --from=builder --chown=mcp:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=mcp:nodejs /app/package*.json ./
COPY --from=builder --chown=mcp:nodejs /app/docker-cli.js ./

# Copy and make CLI aliases executable
COPY --from=builder --chown=mcp:nodejs /app/bin ./bin
RUN chmod +x bin/basic/*.js && \
    chmod +x bin/advanced/*.js && \
    chmod +x docker-cli.js

# Create Docker configuration directory
RUN mkdir -p /home/mcp/.docker && \
    chown mcp:nodejs /home/mcp/.docker

# Create data directory for volumes
RUN mkdir -p /app/data && \
    chown mcp:nodejs /app/data

# Set Docker environment variables
ENV DOCKER_HOST=unix:///var/run/docker.sock
ENV DOCKER_BUILDKIT=1

# Expose port for potential HTTP interface
EXPOSE 3000

# Switch to non-root user
USER mcp

# Create symlinks for global CLI access (optional)
ENV PATH="/app/bin:$PATH"

# Security settings
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('Docker MCP Server is healthy')" || exit 1

# Set default command
CMD ["node", "dist/index.js"]

# Metadata labels
LABEL \
    org.opencontainers.image.title="Docker MCP Server" \
    org.opencontainers.image.description="Enhanced Docker workflow management through MCP with 8 basic operations, 16 advanced workflows, and comprehensive container management" \
    org.opencontainers.image.version="1.8.4" \
    org.opencontainers.image.authors="Sharique Chaudhary" \
    org.opencontainers.image.source="https://github.com/0xshariq/docker-mcp-server" \
    org.opencontainers.image.licenses="ISC" \
    org.opencontainers.image.documentation="https://github.com/0xshariq/docker-mcp-server/blob/main/README.md"
