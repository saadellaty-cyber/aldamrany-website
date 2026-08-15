'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AuthorizationError, requireAdminAction, requireUserAction } from '@/lib/auth/guard';
import {
  checkbox,
  decimal,
  fail,
  integer,
  logActivity,
  ok,
  oneOf,
  oneOfOrNull,
  optionalText,
  text,
  textList,
  uniqueConstraintFields,
  type ActionResult,
} from '@/lib/admin/forms';
import { slugify } from '@/lib/utils';

const PROJECT_STATUSES = ['PLANNED', 'ONGOING', 'COMPLETED'] as const;
const PUBLISH_STATUSES = ['DRAFT', 'PUBLISHED'] as const;

/**
 * Produces a slug that is unique across every project, deriving one from the
 * title when the field was left empty.
 */
async function uniqueSlug(
  field: 'slugAr' | 'slugEn',
  desired: string,
  fallback: string,
  ignoreId?: string,
): Promise<string> {
  const base = slugify(desired || fallback) || 'project';

  let candidate = base;
  for (let attempt = 2; attempt < 200; attempt += 1) {
    const existing = await prisma.project.findFirst({
      where: { [field]: candidate, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

function readProjectFields(formData: FormData) {
  return {
    titleAr: text(formData, 'titleAr'),
    titleEn: text(formData, 'titleEn'),
    shortDescriptionAr: optionalText(formData, 'shortDescriptionAr'),
    shortDescriptionEn: optionalText(formData, 'shortDescriptionEn'),
    descriptionAr: optionalText(formData, 'descriptionAr'),
    descriptionEn: optionalText(formData, 'descriptionEn'),
    locationAr: optionalText(formData, 'locationAr'),
    locationEn: optionalText(formData, 'locationEn'),
    clientAr: optionalText(formData, 'clientAr'),
    clientEn: optionalText(formData, 'clientEn'),
    scopeAr: optionalText(formData, 'scopeAr'),
    scopeEn: optionalText(formData, 'scopeEn'),
    year: integer(formData, 'year'),
    status: oneOfOrNull(formData, 'status', PROJECT_STATUSES),
    governorateId: optionalText(formData, 'governorateId'),
    sectorId: optionalText(formData, 'sectorId'),
    collectionId: optionalText(formData, 'collectionId'),
    featured: checkbox(formData, 'featured'),
    featuredOrder: integer(formData, 'featuredOrder'),
    sortOrder: integer(formData, 'sortOrder') ?? 0,
    seoTitleAr: optionalText(formData, 'seoTitleAr'),
    seoTitleEn: optionalText(formData, 'seoTitleEn'),
    seoDescriptionAr: optionalText(formData, 'seoDescriptionAr'),
    seoDescriptionEn: optionalText(formData, 'seoDescriptionEn'),
    ogImageId: optionalText(formData, 'ogImageId'),
    canonicalUrl: optionalText(formData, 'canonicalUrl'),
    noIndex: checkbox(formData, 'noIndex'),
  };
}

/**
 * Featuring a project without giving it a position would leave it sorted after
 * every ordered one (SQL puts NULLs last), so it could silently never appear.
 * Assign the next free slot instead.
 */
async function resolveFeaturedOrder(
  featured: boolean,
  provided: number | null,
  ignoreId?: string,
): Promise<number | null> {
  if (!featured) return null;
  if (provided !== null) return provided;

  const last = await prisma.project.findFirst({
    where: {
      featured: true,
      featuredOrder: { not: null },
      ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
    },
    orderBy: { featuredOrder: 'desc' },
    select: { featuredOrder: true },
  });

  return (last?.featuredOrder ?? -1) + 1;
}

function validate(fields: ReturnType<typeof readProjectFields>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!fields.titleAr && !fields.titleEn) {
    errors.titleAr = 'Enter the project name in at least one language.';
  }
  if (fields.year !== null && (fields.year < 1900 || fields.year > 2100)) {
    errors.year = 'Enter a year between 1900 and 2100.';
  }
  return errors;
}

/** Publishing state is derived from which submit button was pressed. */
function readPublishIntent(formData: FormData) {
  return oneOf(formData, 'publishStatus', PUBLISH_STATUSES, 'DRAFT');
}

export async function createProject(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const fields = readProjectFields(formData);
  const errors = validate(fields);
  if (Object.keys(errors).length > 0) return fail('Please correct the highlighted fields.', errors);

  const titleFallback = fields.titleEn || fields.titleAr;
  const publishStatus = readPublishIntent(formData);

  let projectId: string;
  try {
    const project = await prisma.project.create({
      data: {
        ...fields,
        featuredOrder: await resolveFeaturedOrder(fields.featured, fields.featuredOrder),
        slugAr: await uniqueSlug('slugAr', text(formData, 'slugAr'), fields.titleAr || titleFallback),
        slugEn: await uniqueSlug('slugEn', text(formData, 'slugEn'), fields.titleEn || titleFallback),
        publishStatus,
        publishedAt: publishStatus === 'PUBLISHED' ? new Date() : null,
        createdById: user.id,
      },
    });
    projectId = project.id;
  } catch (error) {
    const conflicts = uniqueConstraintFields(error);
    if (conflicts.length > 0) {
      return fail('That URL slug is already used by another project.', {
        [conflicts[0]]: 'Already in use.',
      });
    }
    throw error;
  }

  await logActivity(user, {
    action: 'CREATE',
    entityType: 'Project',
    entityId: projectId,
    summary: `Created project "${titleFallback}"`,
  });

  revalidatePath('/admin/projects');
  redirect(`/admin/projects/${projectId}?created=1`);
}

export async function updateProject(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const id = text(formData, 'id');
  if (!id) return fail('Missing project reference.');

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return fail('This project no longer exists.');

  const fields = readProjectFields(formData);
  const errors = validate(fields);
  if (Object.keys(errors).length > 0) return fail('Please correct the highlighted fields.', errors);

  const titleFallback = fields.titleEn || fields.titleAr;
  const publishStatus = readPublishIntent(formData);

  try {
    await prisma.project.update({
      where: { id },
      data: {
        ...fields,
        featuredOrder: await resolveFeaturedOrder(fields.featured, fields.featuredOrder, id),
        slugAr: await uniqueSlug('slugAr', text(formData, 'slugAr'), fields.titleAr || titleFallback, id),
        slugEn: await uniqueSlug('slugEn', text(formData, 'slugEn'), fields.titleEn || titleFallback, id),
        publishStatus,
        // Keep the original publication date when re-publishing.
        publishedAt:
          publishStatus === 'PUBLISHED' ? (existing.publishedAt ?? new Date()) : null,
      },
    });
  } catch (error) {
    const conflicts = uniqueConstraintFields(error);
    if (conflicts.length > 0) {
      return fail('That URL slug is already used by another project.', {
        [conflicts[0]]: 'Already in use.',
      });
    }
    throw error;
  }

  // Manual "related projects" override.
  const relatedIds = textList(formData, 'relatedProjectIds').filter((relatedId) => relatedId !== id);
  await prisma.projectRelation.deleteMany({ where: { projectId: id } });
  if (relatedIds.length > 0) {
    await prisma.projectRelation.createMany({
      data: relatedIds.map((relatedProjectId, index) => ({
        projectId: id,
        relatedProjectId,
        sortOrder: index,
      })),
      skipDuplicates: true,
    });
  }

  await logActivity(user, {
    action: publishStatus === 'PUBLISHED' ? 'PUBLISH' : 'UPDATE',
    entityType: 'Project',
    entityId: id,
    summary: `${publishStatus === 'PUBLISHED' ? 'Published' : 'Saved'} project "${titleFallback}"`,
  });

  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath('/', 'layout');

  return ok(publishStatus === 'PUBLISHED' ? 'Published. The project is live on the website.' : 'Draft saved.');
}

/** Publishes or unpublishes without opening the editor. */
export async function setProjectPublishStatus(formData: FormData): Promise<void> {
  const user = await requireUserAction();
  const id = text(formData, 'id');
  const status = oneOf(formData, 'status', PUBLISH_STATUSES, 'DRAFT');

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return;

  await prisma.project.update({
    where: { id },
    data: {
      publishStatus: status,
      publishedAt: status === 'PUBLISHED' ? (project.publishedAt ?? new Date()) : null,
    },
  });

  await logActivity(user, {
    action: status === 'PUBLISHED' ? 'PUBLISH' : 'UNPUBLISH',
    entityType: 'Project',
    entityId: id,
    summary: `${status === 'PUBLISHED' ? 'Published' : 'Unpublished'} project "${project.titleEn || project.titleAr}"`,
  });

  revalidatePath('/admin/projects');
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath('/', 'layout');
}

/** Copies a project, its gallery rows and its SEO as a fresh draft. */
export async function duplicateProject(formData: FormData): Promise<void> {
  const user = await requireUserAction();
  const id = text(formData, 'id');

  const source = await prisma.project.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!source) return;

  const {
    id: _id,
    slugAr,
    slugEn,
    previewToken: _previewToken,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    publishedAt: _publishedAt,
    images,
    ...rest
  } = source;

  const copy = await prisma.project.create({
    data: {
      ...rest,
      titleAr: source.titleAr ? `${source.titleAr} (نسخة)` : source.titleAr,
      titleEn: source.titleEn ? `${source.titleEn} (copy)` : source.titleEn,
      slugAr: await uniqueSlug('slugAr', `${slugAr}-copy`, 'project'),
      slugEn: await uniqueSlug('slugEn', `${slugEn}-copy`, 'project'),
      // A duplicate always starts as a draft so it cannot go live by accident.
      publishStatus: 'DRAFT',
      publishedAt: null,
      featured: false,
      featuredOrder: null,
      createdById: user.id,
    },
  });

  if (images.length > 0) {
    await prisma.projectImage.createMany({
      data: images.map((image) => ({
        projectId: copy.id,
        mediaAssetId: image.mediaAssetId,
        sortOrder: image.sortOrder,
        isHero: image.isHero,
        isCover: image.isCover,
        focalX: image.focalX,
        focalY: image.focalY,
        mobileFocalX: image.mobileFocalX,
        mobileFocalY: image.mobileFocalY,
        altTextAr: image.altTextAr,
        altTextEn: image.altTextEn,
        captionAr: image.captionAr,
        captionEn: image.captionEn,
      })),
    });
  }

  await logActivity(user, {
    action: 'DUPLICATE',
    entityType: 'Project',
    entityId: copy.id,
    summary: `Duplicated project "${source.titleEn || source.titleAr}"`,
  });

  revalidatePath('/admin', 'layout');
  redirect(`/admin/projects/${copy.id}?duplicated=1`);
}

/**
 * Deleting a project is restricted to administrators.
 *
 * This returns a result instead of redirecting: the caller navigates on the
 * client after calling `router.refresh()`, which is the only reliable way to
 * drop the cached project list. Redirecting from here leaves the browser
 * showing the deleted row until a full page reload.
 */
export async function deleteProject(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAdminAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const id = text(formData, 'id');
  if (!id) return fail('Missing project reference.');

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return fail('This project no longer exists.');

  // Gallery rows cascade; the underlying media assets are intentionally kept.
  await prisma.project.delete({ where: { id } });

  await logActivity(user, {
    action: 'DELETE',
    entityType: 'Project',
    entityId: id,
    summary: `Deleted project "${project.titleEn || project.titleAr}"`,
  });

  // Deliberately no revalidatePath here. Revalidating would re-render the route
  // this form lives on — the project that no longer exists — as a 404, tearing
  // down the component before it can navigate away. The caller redirects and
  // then refreshes; public pages read the database on every request regardless.

  return ok('Project deleted.');
}

/* -------------------------------------------------------------------------
   Gallery
------------------------------------------------------------------------- */

/** Appends media assets to a project's gallery, skipping duplicates. */
export async function addProjectImages(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const projectId = text(formData, 'projectId');
  const mediaIds = textList(formData, 'mediaAssetIds');
  if (!projectId || mediaIds.length === 0) return fail('No images were selected.');

  const last = await prisma.projectImage.findFirst({
    where: { projectId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });
  const existingCount = await prisma.projectImage.count({ where: { projectId } });

  await prisma.projectImage.createMany({
    data: mediaIds.map((mediaAssetId, index) => ({
      projectId,
      mediaAssetId,
      sortOrder: (last?.sortOrder ?? -1) + 1 + index,
      // The very first image added becomes the hero and the cover.
      isHero: existingCount === 0 && index === 0,
      isCover: existingCount === 0 && index === 0,
    })),
    skipDuplicates: true,
  });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/', 'layout');

  return ok(`Added ${mediaIds.length} image${mediaIds.length === 1 ? '' : 's'}.`);
}

/** Persists the order produced by dragging images in the gallery manager. */
export async function reorderProjectImages(formData: FormData): Promise<void> {
  await requireUserAction();

  const projectId = text(formData, 'projectId');
  const orderedIds = textList(formData, 'imageIds');
  if (!projectId || orderedIds.length === 0) return;

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.projectImage.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/', 'layout');
}

/**
 * Marks an image as the hero or the cover. Both are exclusive per project, so
 * the flag is cleared from every other row in the same transaction.
 */
export async function setProjectImageRole(formData: FormData): Promise<void> {
  await requireUserAction();

  const projectId = text(formData, 'projectId');
  const imageId = text(formData, 'imageId');
  const role = oneOf(formData, 'role', ['hero', 'cover'] as const, 'hero');
  if (!projectId || !imageId) return;

  const field = role === 'hero' ? 'isHero' : 'isCover';

  await prisma.$transaction([
    prisma.projectImage.updateMany({ where: { projectId }, data: { [field]: false } }),
    prisma.projectImage.update({ where: { id: imageId }, data: { [field]: true } }),
  ]);

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/', 'layout');
}

/** Saves per-image crop, alt text and caption overrides. */
export async function updateProjectImage(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const projectId = text(formData, 'projectId');
  const imageId = text(formData, 'imageId');
  if (!projectId || !imageId) return fail('Missing image reference.');

  await prisma.projectImage.update({
    where: { id: imageId },
    data: {
      focalX: decimal(formData, 'focalX', 50),
      focalY: decimal(formData, 'focalY', 50),
      mobileFocalX: decimal(formData, 'mobileFocalX', 50),
      mobileFocalY: decimal(formData, 'mobileFocalY', 50),
      altTextAr: optionalText(formData, 'altTextAr'),
      altTextEn: optionalText(formData, 'altTextEn'),
      captionAr: optionalText(formData, 'captionAr'),
      captionEn: optionalText(formData, 'captionEn'),
    },
  });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/', 'layout');

  return ok('Image updated.');
}

/** Removes an image from a project. The media asset itself is untouched. */
export async function removeProjectImage(formData: FormData): Promise<void> {
  await requireUserAction();

  const projectId = text(formData, 'projectId');
  const imageId = text(formData, 'imageId');
  if (!projectId || !imageId) return;

  const removed = await prisma.projectImage.delete({ where: { id: imageId } });

  // If the hero or cover was removed, promote the first remaining image.
  if (removed.isHero || removed.isCover) {
    const next = await prisma.projectImage.findFirst({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
    });
    if (next) {
      await prisma.projectImage.update({
        where: { id: next.id },
        data: {
          isHero: removed.isHero ? true : next.isHero,
          isCover: removed.isCover ? true : next.isCover,
        },
      });
    }
  }

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/', 'layout');
}
