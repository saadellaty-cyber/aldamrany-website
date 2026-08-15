'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { AuthorizationError, requireAdminAction, requireUserAction } from '@/lib/auth/guard';
import {
  checkbox,
  fail,
  logActivity,
  ok,
  oneOf,
  optionalText,
  text,
  type ActionResult,
} from '@/lib/admin/forms';
import { slugify } from '@/lib/utils';

const PUBLISH = ['DRAFT', 'PUBLISHED'] as const;

/** Saves the hero copy and SEO of one fixed marketing page. */
export async function updatePage(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const key = text(formData, 'key');
  if (!key) return fail('Missing page reference.');

  const data = {
    eyebrowAr: optionalText(formData, 'eyebrowAr'),
    eyebrowEn: optionalText(formData, 'eyebrowEn'),
    titleAr: optionalText(formData, 'titleAr'),
    titleEn: optionalText(formData, 'titleEn'),
    introAr: optionalText(formData, 'introAr'),
    introEn: optionalText(formData, 'introEn'),
    heroImageId: optionalText(formData, 'heroImage'),
    seoTitleAr: optionalText(formData, 'seoTitleAr'),
    seoTitleEn: optionalText(formData, 'seoTitleEn'),
    seoDescriptionAr: optionalText(formData, 'seoDescriptionAr'),
    seoDescriptionEn: optionalText(formData, 'seoDescriptionEn'),
    ogImageId: optionalText(formData, 'ogImage'),
    canonicalUrl: optionalText(formData, 'canonicalUrl'),
    noIndex: checkbox(formData, 'noIndex'),
    status: oneOf(formData, 'status', PUBLISH, 'PUBLISHED'),
  };

  await prisma.page.upsert({
    where: { key },
    update: data,
    create: { key, ...data },
  });

  await logActivity(user, {
    action: 'UPDATE',
    entityType: 'Page',
    entityId: key,
    summary: `Updated the "${key}" page`,
  });

  revalidatePath('/admin/pages');
  revalidatePath('/', 'layout');

  return ok('Page saved.');
}

/** Creates or updates a free-form prose block belonging to a page. */
export async function saveContentBlock(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const pageKey = text(formData, 'pageKey');
  if (!pageKey) return fail('Missing page reference.');

  const page = await prisma.page.findUnique({ where: { key: pageKey }, select: { key: true } });
  if (!page) return fail('That page does not exist.');

  const titleEn = optionalText(formData, 'titleEn');
  const titleAr = optionalText(formData, 'titleAr');
  const key = slugify(text(formData, 'key') || titleEn || titleAr || 'block') || `block-${Date.now()}`;

  const data = {
    titleAr,
    titleEn,
    bodyAr: optionalText(formData, 'bodyAr'),
    bodyEn: optionalText(formData, 'bodyEn'),
    imageId: optionalText(formData, 'image'),
    status: oneOf(formData, 'status', PUBLISH, 'PUBLISHED'),
  };

  const existingId = text(formData, 'id');
  if (existingId) {
    await prisma.contentBlock.update({ where: { id: existingId }, data: { ...data, key } });
  } else {
    const count = await prisma.contentBlock.count({ where: { pageKey } });
    await prisma.contentBlock.create({
      data: { pageKey, key, ...data, sortOrder: count },
    });
  }

  await logActivity(user, {
    action: existingId ? 'UPDATE' : 'CREATE',
    entityType: 'ContentBlock',
    entityId: existingId || key,
    summary: `${existingId ? 'Updated' : 'Added'} the "${key}" block on the ${pageKey} page`,
  });

  revalidatePath('/admin/pages');
  revalidatePath('/', 'layout');

  return ok('Block saved.');
}

export async function deleteContentBlock(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const id = text(formData, 'id');
  if (!id) return;

  const block = await prisma.contentBlock.delete({ where: { id } });

  await logActivity(user, {
    action: 'DELETE',
    entityType: 'ContentBlock',
    entityId: id,
    summary: `Deleted the "${block.key}" block from the ${block.pageKey} page`,
  });

  revalidatePath('/admin/pages');
  revalidatePath('/', 'layout');
}
