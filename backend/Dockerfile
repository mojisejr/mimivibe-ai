# backend/Dockerfile
# Stage 1: Build Application
FROM node:18-slim AS builder
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci

# Copy source code from current directory context (backend/Dockerfile -> project root)
COPY ../prisma/ ./prisma/
COPY ../shared/ ./shared/
COPY . ./backend/

# Generate Prisma client
WORKDIR /app
RUN npx prisma generate

# Build backend application
WORKDIR /app/backend
RUN npx tsc

# Stage 2: Final Production Image
FROM node:18-slim

# Install system dependencies for Prisma compatibility
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json .
# Copy prisma schema and generated client
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

# Ensure logs directory exists
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# Create non-root user for security
RUN groupadd --gid 1001 nodejs || true
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home backend || true

# Change ownership of the app directory
RUN chown -R backend:nodejs /app

USER backend

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health/liveness', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/src/server.js"]