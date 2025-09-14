import { PrismaClient } from '@prisma/client'
import { getDatabaseConfig, logDatabaseInfo } from './database-config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaInstance(): PrismaClient {
  const config = getDatabaseConfig()

  // Log database configuration on first initialization
  if (!globalForPrisma.prisma) {
    logDatabaseInfo()
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: config.url,
      },
    },
    log: config.isDevelopment ? ['query', 'info', 'warn'] : ['warn', 'error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaInstance()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma