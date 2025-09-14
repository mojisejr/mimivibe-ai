import { PrismaClient } from '@prisma/client';

export interface DatabaseConfig {
  url: string;
  directUrl?: string;
  environment: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';

  // In development, always use DEV_ prefixed URLs
  // In production, use standard URLs
  const url = isDevelopment
    ? (process.env.DEV_DATABASE_URL || process.env.DATABASE_URL)
    : process.env.DATABASE_URL;

  const directUrl = isDevelopment
    ? (process.env.DEV_DIRECT_URL || process.env.DIRECT_URL)
    : process.env.DIRECT_URL;

  // Safety checks
  if (!url) {
    throw new Error(`Database URL not found. Please set ${isDevelopment ? 'DEV_DATABASE_URL' : 'DATABASE_URL'} in your environment variables.`);
  }

  // Development safety check - prevent accidental production database usage
  if (isDevelopment && url === process.env.DATABASE_URL && process.env.DEV_DATABASE_URL) {
    console.warn('⚠️  WARNING: Development environment is using production database URL. Consider setting DEV_DATABASE_URL for safer development.');
  }

  // Production safety check - ensure we're not using development URLs in production
  if (isProduction && url?.includes('DEV_')) {
    throw new Error('🚫 CRITICAL: Production environment cannot use development database URLs. Please check your environment configuration.');
  }

  return {
    url: url!,
    directUrl,
    environment: nodeEnv as 'development' | 'production' | 'test',
    isDevelopment,
    isProduction
  };
}

export function createPrismaClient(): PrismaClient {
  const config = getDatabaseConfig();

  return new PrismaClient({
    datasources: {
      db: {
        url: config.url,
      },
    },
    log: config.isDevelopment ? ['query', 'info', 'warn'] : ['warn', 'error'],
  });
}

export function logDatabaseInfo(): void {
  const config = getDatabaseConfig();
  const dbHost = new URL(config.url).hostname;

  console.log(`🗄️  Database: ${config.environment} environment`);
  console.log(`🔗 Host: ${dbHost}`);
  console.log(`✅ Configuration: ${config.isDevelopment ? 'Development (Safe)' : 'Production'}`);

  if (config.isDevelopment) {
    console.log('🔒 Development mode: Using development database configuration');
  }
}