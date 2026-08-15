import type { PoolConfig } from 'pg';

/**
 * Connection options shared by the application and the command-line scripts
 * (seed, admin creation), so a hosted database behaves identically in both.
 *
 * Managed PostgreSQL providers (Supabase, Neon, RDS…) require TLS and usually
 * present a certificate signed by a root the Node runtime does not carry.
 * `sslmode` in the connection string decides what we do:
 *
 *   require / prefer / no-verify → encrypt, accept the provider's chain
 *   verify-ca / verify-full      → encrypt and verify against the system roots
 *   disable                      → no TLS
 *   omitted                      → TLS for remote hosts, plain for localhost
 */
type SslSetting = PoolConfig['ssl'];

function parse(connectionString: string): { ssl: SslSetting; cleaned: string } {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return { ssl: undefined, cleaned: connectionString };
  }

  const mode = url.searchParams.get('sslmode');

  let ssl: SslSetting;
  if (mode === 'disable') {
    ssl = undefined;
  } else if (mode === 'require' || mode === 'prefer' || mode === 'no-verify') {
    ssl = { rejectUnauthorized: false };
  } else if (mode === 'verify-ca' || mode === 'verify-full') {
    ssl = { rejectUnauthorized: true };
  } else {
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    ssl = isLocal ? undefined : { rejectUnauthorized: false };
  }

  // node-postgres derives its own TLS settings from `sslmode` in the string and
  // those take precedence over the explicit `ssl` option, which would reject a
  // provider chain we deliberately chose to accept. Drop the parameter and let
  // the option above be the single source of truth.
  url.searchParams.delete('sslmode');

  return { ssl, cleaned: url.toString() };
}

export function pgSsl(connectionString: string): SslSetting {
  return parse(connectionString).ssl;
}

/** Full pool configuration for the running application. */
export function pgConfig(connectionString: string): PoolConfig {
  const { ssl, cleaned } = parse(connectionString);

  return {
    connectionString: cleaned,
    ...(ssl ? { ssl } : {}),
    // A single long-running server process; keep the pool modest so a shared
    // hosting connection limit is never exhausted.
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
  };
}

/**
 * Configuration for one-off scripts (seed, admin creation).
 *
 * These run long sequences of small statements against a connection pooler,
 * which drops connections it considers idle — the pool would then hand out a
 * dead socket and the script fails with "Connection terminated unexpectedly".
 * A single keep-alive connection that is never reaped avoids that entirely.
 */
export function pgScriptConfig(connectionString: string): PoolConfig {
  const { ssl, cleaned } = parse(connectionString);

  return {
    connectionString: cleaned,
    ...(ssl ? { ssl } : {}),
    max: 1,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 30_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5_000,
  };
}
