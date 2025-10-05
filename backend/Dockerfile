# backend/Dockerfile
# Stage 1: Prisma Generation
FROM node:18-slim AS prisma-stage
WORKDIR /app
COPY prisma/ ./prisma/
COPY package.json package-lock.json ./
RUN npm install --only=production
RUN npx prisma generate

# Stage 2: Build Application
FROM node:18-slim AS builder
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy the entire project structure to match local development
COPY backend/ ./backend/
COPY shared/ ./shared/
COPY --from=prisma-stage /app/node_modules/.prisma/client ./backend/node_modules/.prisma/client
COPY --from=prisma-stage /app/prisma ./backend/prisma

# Install dependencies and build from backend directory
WORKDIR /app/backend
RUN npm ci
RUN npx prisma generate
RUN npx tsc --project tsconfig.docker.json

# Stage 3: Final Production Image
FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json .
# Copy prisma schema and generated client
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/node_modules/.prisma/client ./node_modules/.prisma/client

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
CMD ["node", "dist/server.js"]