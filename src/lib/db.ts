import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { env } from '@/lib/env';

/**
 * Prisma 7 talks to PostgreSQL through a driver adapter. A single client is
 * cached on globalThis so hot-reloads in development don't exhaust the
 * connection pool.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Managed PostgreSQL providers (Supabase, Neon, RDS…) require TLS, and most
 * present a certificate signed by a root the Node runtime does not carry. The
 * driver would reject it, so honour `sslmode` from the connection string:
 *
 *   sslmode=require  → encrypt, accept the provider's certificate chain
 *   sslmode=disable  → no TLS (local development)
 *   omitted          → TLS for remote hosts, plain for localhost
 */
function sslOptions(connectionString: string) {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return undefined;
  }

  const mode = url.searchParams.get('sslmode');
  if (mode === 'disable') return undefined;

  if (mode === 'require' || mode === 'prefer' || mode === 'no-verify') {
    return { rejectUnauthorized: false };
  }

  if (mode === 'verify-ca' || mode === 'verify-full') {
    return { rejectUnauthorized: true };
  }

  // No explicit mode: local databases are plaintext, anything else is remote.
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  return isLocal ? undefined : { rejectUnauthorized: false };
}

function createClient(): PrismaClient {
  const connectionString = env.databaseUrl;
  const ssl = sslOptions(connectionString);

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      ...(ssl ? { ssl } : {}),
      // A single long-running server process; keep the pool modest so a
      // shared-hosting connection limit is never exhausted.
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 15_000,
    }),
    log: env.isProduction ? ['error'] : ['error', 'warn'],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}
