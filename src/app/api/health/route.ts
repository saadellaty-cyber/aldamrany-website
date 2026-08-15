import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Operational health check.
 *
 * Reports whether each subsystem the site depends on is reachable, so a
 * deployment can be diagnosed without shell access to the host. It never
 * returns configuration values — only whether they are present — and error
 * text is scrubbed of anything that could carry a credential.
 */

/** Removes connection strings, credentials and long tokens from error text. */
function scrub(message: string): string {
  return message
    .replace(/[a-z+]+:\/\/[^\s]*@[^\s]*/gi, '<connection-string>')
    .replace(/password[^\s,;]*/gi, 'password=<redacted>')
    .replace(/\b[A-Za-z0-9_-]{32,}\b/g, '<token>')
    .slice(0, 300);
}

function describe(error: unknown): { name: string; message: string; code?: string } {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    return {
      name: error.name,
      message: scrub(error.message),
      ...(code ? { code: String(code) } : {}),
    };
  }
  return { name: 'Unknown', message: scrub(String(error)) };
}

export async function GET() {
  const started = Date.now();

  // Presence only — never the values themselves.
  const configured: Record<string, boolean> = {};
  for (const key of [
    'DATABASE_URL',
    'AUTH_SECRET',
    'NEXT_PUBLIC_SITE_URL',
    'STORAGE_DRIVER',
    'R2_ENDPOINT',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET',
    'R2_PUBLIC_URL',
  ]) {
    configured[key] = Boolean(process.env[key]?.trim());
  }

  // Which host the database URL points at, without user, password or database.
  let databaseHost: string | null = null;

  /**
   * A fingerprint of the credential — never the credential itself. Comparing
   * this with the value computed locally shows whether the host stored the
   * connection string intact, which percent-encoded characters can break.
   */
  let credentialFingerprint: Record<string, unknown> | null = null;

  try {
    const raw = process.env.DATABASE_URL ?? '';
    const url = new URL(raw);
    databaseHost = `${url.hostname}:${url.port || '5432'}`;

    const { createHash } = await import('node:crypto');
    const decoded = decodeURIComponent(url.password);

    credentialFingerprint = {
      user: url.username,
      rawUrlLength: raw.length,
      passwordLength: decoded.length,
      passwordSha256: createHash('sha256').update(decoded).digest('hex').slice(0, 12),
      passwordWasPercentEncoded: url.password !== decoded,
      passwordEndsWithBracket: decoded.endsWith(']'),
      hasQueryString: raw.includes('?'),
    };
  } catch {
    databaseHost = null;
  }

  const checks: Record<string, unknown> = {};

  // --- Database -------------------------------------------------------------
  const dbStarted = Date.now();
  try {
    const { prisma } = await import('@/lib/db');
    const projects = await prisma.project.count();
    checks.database = { ok: true, ms: Date.now() - dbStarted, publishedProjects: projects };
  } catch (error) {
    checks.database = { ok: false, ms: Date.now() - dbStarted, error: describe(error) };
  }

  // --- Object storage -------------------------------------------------------
  const storageStarted = Date.now();
  try {
    const { storage } = await import('@/lib/storage');
    const driver = storage();
    // Deriving a URL exercises the configuration without any network call.
    const sample = driver.url('media/health-check.txt');
    checks.storage = {
      ok: true,
      ms: Date.now() - storageStarted,
      driver: driver.name,
      sampleUrlHost: (() => {
        try {
          return new URL(sample).host;
        } catch {
          return 'relative';
        }
      })(),
    };
  } catch (error) {
    checks.storage = { ok: false, ms: Date.now() - storageStarted, error: describe(error) };
  }

  // --- Translations ---------------------------------------------------------
  try {
    const messages = await import('../../../../messages/ar.json');
    checks.translations = { ok: true, keys: Object.keys(messages.default ?? {}).length };
  } catch (error) {
    checks.translations = { ok: false, error: describe(error) };
  }

  // --- Sitemap --------------------------------------------------------------
  // Generated from the database; a failure here is invisible to visitors but
  // breaks search-engine indexing, so it is worth surfacing.
  const sitemapStarted = Date.now();
  try {
    const sitemap = (await import('@/app/sitemap')).default;
    const entries = await sitemap();
    checks.sitemap = { ok: true, ms: Date.now() - sitemapStarted, entries: entries.length };
  } catch (error) {
    checks.sitemap = { ok: false, ms: Date.now() - sitemapStarted, error: describe(error) };
  }

  const healthy = Object.values(checks).every(
    (check) => (check as { ok: boolean }).ok === true,
  );

  return NextResponse.json(
    {
      healthy,
      node: process.version,
      databaseHost,
      credentialFingerprint,
      configured,
      checks,
      totalMs: Date.now() - started,
    },
    {
      status: healthy ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
