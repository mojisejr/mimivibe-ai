import { PrismaClient } from '@prisma/client';
import { getDatabaseConfig, logDatabaseInfo } from './database-config';

export function createSeedPrismaClient(): PrismaClient {
  const config = getDatabaseConfig();

  console.log('🌱 Initializing seed database connection...');
  logDatabaseInfo();

  // Warn if seeding production database
  if (config.isProduction) {
    console.warn('⚠️  WARNING: You are about to seed the PRODUCTION database!');
    console.warn('⚠️  Please confirm this is intentional.');
    console.warn('⚠️  Set NODE_ENV=development to use the development database.');
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: config.url,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  });
}

export async function seedWithSafetyChecks<T>(
  seedFunction: (prisma: PrismaClient) => Promise<T>,
  scriptName: string
): Promise<T> {
  const prisma = createSeedPrismaClient();

  try {
    console.log(`🚀 Starting ${scriptName}...`);
    const result = await seedFunction(prisma);
    console.log(`✅ ${scriptName} completed successfully`);
    return result;
  } catch (error) {
    console.error(`❌ ${scriptName} failed:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}