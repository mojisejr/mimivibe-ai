# Use Node.js 18 Debian for better Prisma compatibility
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install system dependencies for native modules and Prisma
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libpng-dev \
    libssl-dev \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and tsconfig
COPY backend/package*.json ./
COPY backend/tsconfig.docker.json ./tsconfig.json

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY backend/src/ ./src/
COPY shared/ ./shared/
COPY prisma/ ./prisma/

# Create logs directory
RUN mkdir -p logs

# Build the application
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create non-root user for security
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home backend

# Change ownership of the app directory
RUN chown -R backend:nodejs /app
USER backend

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health/liveness', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]