'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { AuthorizationError, requireAdminAction, requireUserAction } from '@/lib/auth/guard';
import { storage } from '@/lib/storage';
import { getMediaUsage } from '@/lib/admin/media';
import {
  checkbox,
  decimal,
  fail,
  logActivity,
  ok,
  optionalText,
  type ActionResult,
} from '@/lib/admin/forms';

/** Saves alt text, captions and the focal points of a library asset. */
export async function updateMediaAsset(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return fail('Missing asset reference.');

  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: {
      altAr: optionalText(formData, 'altAr'),
      altEn: optionalText(formData, 'altEn'),
      captionAr: optionalText(formData, 'captionAr'),
      captionEn: optionalText(formData, 'captionEn'),
      focalX: decimal(formData, 'focalX', 50),
      focalY: decimal(formData, 'focalY', 50),
      mobileFocalX: decimal(formData, 'mobileFocalX', 50),
      mobileFocalY: decimal(formData, 'mobileFocalY', 50),
    },
  });

  await logActivity(user, {
    action: 'UPDATE',
    entityType: 'MediaAsset',
    entityId: asset.id,
    summary: `Updated media "${asset.originalName}"`,
  });

  revalidatePath('/admin/media');
  revalidatePath(`/admin/media/${id}`);

  return ok('Saved.');
}

/**
 * Deletes an asset and its stored file.
 *
 * Restricted to administrators, and refused outright while the asset is still
 * referenced anywhere — the confirmation UI shows exactly where.
 */
export async function deleteMediaAsset(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAdminAction();
  } catch (error) {
    return fail(
      error instanceof AuthorizationError ? error.message : 'Not authorised.',
    );
  }

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return fail('Missing asset reference.');

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return fail('This asset no longer exists.');

  const usage = await getMediaUsage(id);
  const force = checkbox(formData, 'force');

  if (usage.length > 0 && !force) {
    const summary = usage.map((entry) => `${entry.label} (${entry.count})`).join(', ');
    return fail(
      `This image is still used in: ${summary}. Confirm below to remove it from those places as well.`,
    );
  }

  await prisma.mediaAsset.delete({ where: { id } });
  await storage().delete(asset.storageKey).catch(() => {
    // The row is already gone; a stranded object is preferable to a failed delete.
  });

  await logActivity(user, {
    action: 'DELETE',
    entityType: 'MediaAsset',
    entityId: id,
    summary: `Deleted media "${asset.originalName}"`,
  });

  // No revalidatePath: it would re-render this asset's own route, which no
  // longer resolves. The caller performs a full navigation to the library,
  // which is also what guarantees the list is not served from the client cache.
  return ok('Image deleted.');
}
