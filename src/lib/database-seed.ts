import { PrismaClient } from '@prisma/client';
import { createPrismaClient, getEnvironmentInfo } from './database-config';

/**
 * Create a PrismaClient instance for seeding with appropriate logging
 */
export function createSeedPrismaClient(): PrismaClient {
  const { environment, isProduction } = getEnvironmentInfo();

  console.log('🌱 Initializing seed database connection...');
  console.log(`🗄️  Environment: ${environment}`);

  // Warn if seeding production database
  if (isProduction) {
    console.warn('⚠️  WARNING: You are about to seed the PRODUCTION database!');
    console.warn('⚠️  Please confirm this is intentional.');
  }

  // Use standard createPrismaClient but with enhanced logging for seeding
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
}