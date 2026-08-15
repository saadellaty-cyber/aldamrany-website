import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUserAction, AuthorizationError } from '@/lib/auth/guard';
import { storage } from '@/lib/storage';
import { buildStorageKey, processUpload, UploadError } from '@/lib/media/process';
import { logActivity } from '@/lib/admin/forms';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
// Large multi-file uploads must not be cut short by a default timeout.
export const maxDuration = 60;

/**
 * Receives dashboard uploads.
 *
 * A route handler is used rather than a server action because uploads need to
 * stream real files (server actions are body-size limited) and because the
 * browser can report genuine progress against an XHR request.
 *
 * Each file is validated by its actual bytes, re-encoded, given a random
 * storage key and recorded as a MediaAsset.
 */
export async function POST(request: Request) {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    const status = error instanceof AuthorizationError ? 403 : 401;
    return NextResponse.json({ error: 'Not authorised.' }, { status });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Could not read the upload.' }, { status: 400 });
  }

  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files were received.' }, { status: 400 });
  }

  /** When set, the uploaded file replaces this asset's binary in place. */
  const replaceId = formData.get('replaceId');

  const created: Array<{ id: string; url: string; name: string }> = [];
  const failed: Array<{ name: string; error: string }> = [];

  for (const file of files) {
    try {
      if (file.size > env.maxUploadBytes) {
        throw new UploadError(
          `File is larger than the ${Math.round(env.maxUploadBytes / (1024 * 1024))} MB limit.`,
        );
      }

      const input = Buffer.from(await file.arrayBuffer());
      const processed = await processUpload(input);
      const key = buildStorageKey(file.name, processed.extension);
      const stored = await storage().put(key, processed.buffer, processed.mimeType);

      if (typeof replaceId === 'string' && replaceId) {
        const existing = await prisma.mediaAsset.findUnique({ where: { id: replaceId } });
        if (!existing) throw new UploadError('The asset being replaced no longer exists.');

        const updated = await prisma.mediaAsset.update({
          where: { id: replaceId },
          data: {
            storageKey: stored.key,
            url: stored.url,
            originalName: file.name.slice(0, 200),
            mimeType: processed.mimeType,
            fileSize: processed.buffer.byteLength,
            width: processed.width,
            height: processed.height,
            blurDataUrl: processed.blurDataUrl,
          },
        });

        // Remove the superseded object only after the row points at the new one.
        await storage().delete(existing.storageKey).catch(() => {});

        await logActivity(user, {
          action: 'REPLACE',
          entityType: 'MediaAsset',
          entityId: updated.id,
          summary: `Replaced media "${updated.originalName}"`,
        });

        created.push({ id: updated.id, url: stored.url, name: updated.originalName });
        break; // A replace operation only ever consumes one file.
      }

      const asset = await prisma.mediaAsset.create({
        data: {
          storageKey: stored.key,
          url: stored.url,
          originalName: file.name.slice(0, 200),
          mimeType: processed.mimeType,
          fileSize: processed.buffer.byteLength,
          width: processed.width,
          height: processed.height,
          blurDataUrl: processed.blurDataUrl,
          uploadedById: user.id,
        },
      });

      created.push({ id: asset.id, url: stored.url, name: asset.originalName });
    } catch (error) {
      failed.push({
        name: file.name,
        error: error instanceof UploadError ? error.message : 'The file could not be processed.',
      });
    }
  }

  if (created.length > 0) {
    await logActivity(user, {
      action: 'UPLOAD',
      entityType: 'MediaAsset',
      summary: `Uploaded ${created.length} file${created.length === 1 ? '' : 's'}`,
    });
  }

  return NextResponse.json(
    { created, failed },
    { status: created.length === 0 ? 422 : 200 },
  );
}
