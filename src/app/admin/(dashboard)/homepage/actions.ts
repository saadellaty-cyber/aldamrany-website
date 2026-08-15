'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { AuthorizationError, requireUserAction } from '@/lib/auth/guard';
import {
  checkbox,
  fail,
  logActivity,
  ok,
  optionalText,
  text,
  textList,
  type ActionResult,
} from '@/lib/admin/forms';

/** Saves one editable band of the homepage. */
export async function updateHomepageSection(
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
  if (!key) return fail('Missing section reference.');

  const data = {
    eyebrowAr: optionalText(formData, 'eyebrowAr'),
    eyebrowEn: optionalText(formData, 'eyebrowEn'),
    titleAr: optionalText(formData, 'titleAr'),
    titleEn: optionalText(formData, 'titleEn'),
    subtitleAr: optionalText(formData, 'subtitleAr'),
    subtitleEn: optionalText(formData, 'subtitleEn'),
    bodyAr: optionalText(formData, 'bodyAr'),
    bodyEn: optionalText(formData, 'bodyEn'),
    primaryCtaLabelAr: optionalText(formData, 'primaryCtaLabelAr'),
    primaryCtaLabelEn: optionalText(formData, 'primaryCtaLabelEn'),
    primaryCtaHref: optionalText(formData, 'primaryCtaHref'),
    secondaryCtaLabelAr: optionalText(formData, 'secondaryCtaLabelAr'),
    secondaryCtaLabelEn: optionalText(formData, 'secondaryCtaLabelEn'),
    secondaryCtaHref: optionalText(formData, 'secondaryCtaHref'),
    imageId: optionalText(formData, 'image'),
    enabled: checkbox(formData, 'enabled'),
  };

  await prisma.homepageSection.upsert({
    where: { key },
    update: data,
    create: { key, ...data },
  });

  await logActivity(user, {
    action: 'UPDATE',
    entityType: 'HomepageSection',
    entityId: key,
    summary: `Updated homepage section "${key}"`,
  });

  revalidatePath('/admin/homepage');
  revalidatePath('/', 'layout');

  return ok('Saved. The homepage has been updated.');
}

/**
 * Replaces the homepage project selection in one operation: every project not
 * in the submitted list is unfeatured, and the order follows the list.
 */
export async function updateFeaturedProjects(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const ids = textList(formData, 'featuredIds');

  await prisma.$transaction([
    prisma.project.updateMany({
      where: { featured: true, NOT: { id: { in: ids } } },
      data: { featured: false, featuredOrder: null },
    }),
    ...ids.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { featured: true, featuredOrder: index },
      }),
    ),
  ]);

  await logActivity(user, {
    action: 'UPDATE',
    entityType: 'Project',
    summary: `Updated the homepage project selection (${ids.length} project${ids.length === 1 ? '' : 's'})`,
  });

  revalidatePath('/admin/homepage');
  revalidatePath('/', 'layout');

  return ok('Homepage projects updated.');
}
