import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { env } from '@/lib/env';
import { pgConfig } from '@/lib/pg-options';

/**
 * Prisma 7 talks to PostgreSQL through a driver adapter. A single client is
 * cached on globalThis so hot-reloads in development don't exhaust the
 * connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg(pgConfig(env.databaseUrl)),
    log: env.isProduction ? ['error'] : ['error', 'warn'],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}
