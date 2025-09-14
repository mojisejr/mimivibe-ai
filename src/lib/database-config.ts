import { PrismaClient } from '@prisma/client';

/**
 * Standard database configuration using Next.js/Vercel environment pattern
 * - Local: Uses DATABASE_URL from .env file
 * - Production: Vercel automatically overrides with production environment variables
 */
export function createPrismaClient(): PrismaClient {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return new PrismaClient({
    log: isDevelopment ? ['query', 'info', 'warn'] : ['warn', 'error'],
  });
}

/**
 * Get current environment information for logging
 */
export function getEnvironmentInfo() {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const environment = process.env.NODE_ENV || 'development';

  return {
    environment,
    isDevelopment,
    isProduction: !isDevelopment
  };
}