import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaInstance(): PrismaClient {
  const isDevelopment = process.env.NODE_ENV !== 'production'

  return new PrismaClient({
    log: isDevelopment ? ['query', 'info', 'warn'] : ['warn', 'error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaInstance()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma