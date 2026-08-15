import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { env } from '@/lib/env';
import type { StorageDriver, StoredObject } from '@/lib/storage/types';

/**
 * Cloudflare R2 (or any S3-compatible bucket).
 *
 * The bucket is expected to be exposed through a public base URL — a custom
 * domain or the r2.dev subdomain — so images are served straight from the CDN
 * rather than proxied through the app.
 */
let client: S3Client | undefined;

function s3(): S3Client {
  if (!client) {
    const { endpoint, region, accessKeyId, secretAccessKey } = env.r2;
    client = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return client;
}

async function toBuffer(body: unknown): Promise<Buffer> {
  const stream = body as AsyncIterable<Uint8Array>;
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export const r2Driver: StorageDriver = {
  name: 'r2',

  async put(key, body, contentType) {
    await s3().send(
      new PutObjectCommand({
        Bucket: env.r2.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return { key, url: this.url(key) } satisfies StoredObject;
  },

  async delete(key) {
    await s3().send(new DeleteObjectCommand({ Bucket: env.r2.bucket, Key: key }));
  },

  async read(key) {
    try {
      const result = await s3().send(
        new GetObjectCommand({ Bucket: env.r2.bucket, Key: key }),
      );
      if (!result.Body) return null;
      return {
        body: await toBuffer(result.Body),
        contentType: result.ContentType ?? 'application/octet-stream',
      };
    } catch {
      return null;
    }
  },

  url(key) {
    return `${env.r2.publicUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;
  },
};
