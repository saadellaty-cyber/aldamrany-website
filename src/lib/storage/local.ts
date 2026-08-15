import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '@/lib/env';
import type { StorageDriver, StoredObject } from '@/lib/storage/types';

/**
 * Filesystem-backed storage for development and single-server deployments.
 *
 * Files are written outside `public/` and served by /api/media/[...path], so
 * uploads made after a build are still reachable (Next copies `public/` at
 * build time and would never see them).
 */
function rootDir(): string {
  // The bundler cannot statically analyse this path and would otherwise try to
  // trace the whole directory into the deployment bundle.
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), env.localStorageDir);
}

/**
 * Resolves a storage key to an absolute path, refusing anything that escapes
 * the storage root (`../`, absolute paths, drive letters).
 */
function resolveKey(key: string): string {
  const root = rootDir();
  const target = path.resolve(root, key);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Invalid storage key.');
  }
  return target;
}

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

export const localDriver: StorageDriver = {
  name: 'local',

  async put(key, body, contentType) {
    const target = resolveKey(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, body);
    void contentType; // content type is derived from the extension on read
    return { key, url: this.url(key) } satisfies StoredObject;
  },

  async delete(key) {
    await fs.rm(resolveKey(key), { force: true });
  },

  async read(key) {
    try {
      const target = resolveKey(key);
      const body = await fs.readFile(target);
      const contentType =
        EXTENSION_CONTENT_TYPES[path.extname(target).toLowerCase()] ?? 'application/octet-stream';
      return { body, contentType };
    } catch {
      return null;
    }
  },

  url(key) {
    return `/api/media/${key.split('/').map(encodeURIComponent).join('/')}`;
  },
};
