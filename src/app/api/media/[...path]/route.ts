import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { env } from '@/lib/env';

/**
 * Serves locally-stored uploads (STORAGE_DRIVER=local).
 *
 * Files live outside `public/` so that images uploaded after a build are still
 * reachable. With STORAGE_DRIVER=r2 assets are served straight from the bucket
 * and this route is never hit.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (env.storageDriver !== 'local') {
    return new NextResponse('Not found', { status: 404 });
  }

  const { path } = await params;
  const key = path.map((segment) => decodeURIComponent(segment)).join('/');

  // The driver rejects any key that escapes the storage root.
  let file: { body: Buffer; contentType: string } | null = null;
  try {
    file = await storage().read(key);
  } catch {
    return new NextResponse('Bad request', { status: 400 });
  }

  if (!file) return new NextResponse('Not found', { status: 404 });

  const headers = new Headers({
    'Content-Type': file.contentType,
    'Content-Length': String(file.body.byteLength),
    // Storage keys contain a random component, so contents never change.
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });

  // Uploaded SVG is sanitised on the way in; sandboxing it on the way out
  // means even a missed vector cannot execute in the site's origin.
  if (file.contentType === 'image/svg+xml') {
    headers.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  }

  return new NextResponse(new Uint8Array(file.body), { headers });
}
