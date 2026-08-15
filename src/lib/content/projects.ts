import { cache } from 'react';
import { prisma } from '@/lib/db';
import { toImageRef, type ImageRef } from '@/lib/content/media';
import { pick, type Locale } from '@/i18n/config';
import { toParagraphs } from '@/lib/utils';
import type { ProjectStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

const cardInclude = {
  sector: true,
  governorate: true,
  collection: true,
  images: {
    include: { mediaAsset: true },
    orderBy: [{ isCover: 'desc' }, { isHero: 'desc' }, { sortOrder: 'asc' }],
  },
} satisfies Prisma.ProjectInclude;

type ProjectWithRelations = Prisma.ProjectGetPayload<{ include: typeof cardInclude }>;

export type ProjectCard = {
  id: string;
  title: string;
  slug: string;
  href: string;
  summary: string | null;
  location: string | null;
  sector: string | null;
  sectorSlug: string | null;
  year: number | null;
  status: ProjectStatus | null;
  collection: string | null;
  image: ImageRef | null;
  imageCount: number;
};

export function projectSlug(
  project: { slugAr: string; slugEn: string },
  locale: Locale,
): string {
  return locale === 'ar' ? project.slugAr : project.slugEn;
}

export function projectHref(project: { slugAr: string; slugEn: string }, locale: Locale): string {
  return `/${locale}/projects/${encodeURIComponent(projectSlug(project, locale))}`;
}

/** Cover image: an explicit cover, else the hero, else the first gallery image. */
function coverImage(project: ProjectWithRelations, locale: Locale): ImageRef | null {
  const row =
    project.images.find((image) => image.isCover) ??
    project.images.find((image) => image.isHero) ??
    project.images[0];

  if (!row) return null;
  return toImageRef(row.mediaAsset, locale, row, pick(locale, project.titleAr, project.titleEn) ?? '');
}

function toCard(project: ProjectWithRelations, locale: Locale): ProjectCard {
  return {
    id: project.id,
    title: pick(locale, project.titleAr, project.titleEn) ?? '',
    slug: projectSlug(project, locale),
    href: projectHref(project, locale),
    summary: pick(locale, project.shortDescriptionAr, project.shortDescriptionEn),
    location: pick(locale, project.locationAr, project.locationEn),
    sector: project.sector ? pick(locale, project.sector.nameAr, project.sector.nameEn) : null,
    sectorSlug: project.sector?.slug ?? null,
    year: project.year,
    status: project.status,
    collection: project.collection
      ? pick(locale, project.collection.nameAr, project.collection.nameEn)
      : null,
    image: coverImage(project, locale),
    imageCount: project.images.length,
  };
}

// ---------------------------------------------------------------------------
// Listing
// ---------------------------------------------------------------------------

export type ProjectFilters = {
  governorate?: string;
  sector?: string;
  collection?: string;
  year?: string;
  status?: string;
  q?: string;
};

function buildWhere(filters: ProjectFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = { publishStatus: 'PUBLISHED' };

  if (filters.governorate) where.governorate = { slug: filters.governorate };
  if (filters.sector) where.sector = { slug: filters.sector };
  if (filters.collection) where.collection = { slug: filters.collection };

  const year = Number(filters.year);
  if (Number.isInteger(year) && year > 1900) where.year = year;

  if (filters.status === 'PLANNED' || filters.status === 'ONGOING' || filters.status === 'COMPLETED') {
    where.status = filters.status;
  }

  const query = filters.q?.trim();
  if (query) {
    // Search both languages so an Arabic term finds an English-titled record.
    where.OR = [
      { titleAr: { contains: query, mode: 'insensitive' } },
      { titleEn: { contains: query, mode: 'insensitive' } },
      { shortDescriptionAr: { contains: query, mode: 'insensitive' } },
      { shortDescriptionEn: { contains: query, mode: 'insensitive' } },
      { locationAr: { contains: query, mode: 'insensitive' } },
      { locationEn: { contains: query, mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function listProjects(
  locale: Locale,
  filters: ProjectFilters = {},
): Promise<ProjectCard[]> {
  const projects = await prisma.project.findMany({
    where: buildWhere(filters),
    include: cardInclude,
    orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return projects.map((project) => toCard(project, locale));
}

export async function countProjects(filters: ProjectFilters = {}): Promise<number> {
  return prisma.project.count({ where: buildWhere(filters) });
}

export async function getFeaturedProjects(locale: Locale, limit = 4): Promise<ProjectCard[]> {
  const projects = await prisma.project.findMany({
    where: { publishStatus: 'PUBLISHED', featured: true },
    include: cardInclude,
    orderBy: [{ featuredOrder: 'asc' }, { updatedAt: 'desc' }],
    take: limit,
  });

  return projects.map((project) => toCard(project, locale));
}

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

export type FilterOption = { value: string; label: string; count: number };

export type ProjectFilterOptions = {
  governorates: FilterOption[];
  sectors: FilterOption[];
  collections: FilterOption[];
  years: FilterOption[];
  statuses: FilterOption[];
};

/**
 * Only values that actually occur among published projects are offered, so the
 * archive never presents a filter that returns nothing.
 */
export const getProjectFilterOptions = cache(
  async (locale: Locale): Promise<ProjectFilterOptions> => {
    const projects = await prisma.project.findMany({
      where: { publishStatus: 'PUBLISHED' },
      select: {
        year: true,
        status: true,
        sector: { select: { slug: true, nameAr: true, nameEn: true, sortOrder: true } },
        governorate: { select: { slug: true, nameAr: true, nameEn: true, sortOrder: true } },
        collection: { select: { slug: true, nameAr: true, nameEn: true, sortOrder: true } },
      },
    });

    const tally = <T extends { slug: string; nameAr: string; nameEn: string; sortOrder: number }>(
      accessor: (project: (typeof projects)[number]) => T | null,
    ): FilterOption[] => {
      const map = new Map<string, { option: FilterOption; sortOrder: number }>();
      for (const project of projects) {
        const entity = accessor(project);
        if (!entity) continue;
        const existing = map.get(entity.slug);
        if (existing) {
          existing.option.count += 1;
        } else {
          map.set(entity.slug, {
            sortOrder: entity.sortOrder,
            option: {
              value: entity.slug,
              label: pick(locale, entity.nameAr, entity.nameEn) ?? entity.slug,
              count: 1,
            },
          });
        }
      }
      return [...map.values()]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((entry) => entry.option);
    };

    const years = new Map<number, number>();
    const statuses = new Map<ProjectStatus, number>();
    for (const project of projects) {
      if (project.year) years.set(project.year, (years.get(project.year) ?? 0) + 1);
      if (project.status) statuses.set(project.status, (statuses.get(project.status) ?? 0) + 1);
    }

    return {
      governorates: tally((project) => project.governorate),
      sectors: tally((project) => project.sector),
      collections: tally((project) => project.collection),
      years: [...years.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([year, count]) => ({ value: String(year), label: String(year), count })),
      statuses: [...statuses.entries()].map(([status, count]) => ({
        value: status,
        label: status,
        count,
      })),
    };
  },
);

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export type ProjectDetail = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus | null;
  publishStatus: 'DRAFT' | 'PUBLISHED';
  isDraft: boolean;
  location: string | null;
  sector: string | null;
  collection: { name: string; slug: string } | null;
  year: number | null;
  client: string | null;
  scope: string[];
  summary: string | null;
  description: string[];
  hero: ImageRef | null;
  gallery: ImageRef[];
  seo: {
    title: string | null;
    description: string | null;
    ogImage: string | null;
    canonicalUrl: string | null;
    noIndex: boolean;
  };
  slugs: { ar: string; en: string };
  sectorId: string | null;
  governorateId: string | null;
  collectionId: string | null;
};

const detailInclude = {
  sector: true,
  governorate: true,
  collection: true,
  ogImage: true,
  images: {
    include: { mediaAsset: true },
    orderBy: { sortOrder: 'asc' },
  },
} satisfies Prisma.ProjectInclude;

/**
 * Fetches a project by either language's slug. Drafts resolve only when the
 * caller supplies the matching preview token.
 */
export async function getProjectBySlug(
  slug: string,
  locale: Locale,
  options: { previewToken?: string | null } = {},
): Promise<ProjectDetail | null> {
  const project = await prisma.project.findFirst({
    where: { OR: [{ slugAr: slug }, { slugEn: slug }] },
    include: detailInclude,
  });

  if (!project) return null;

  const isDraft = project.publishStatus === 'DRAFT';
  if (isDraft && project.previewToken !== options.previewToken) return null;

  const title = pick(locale, project.titleAr, project.titleEn) ?? '';

  const heroRow =
    project.images.find((image) => image.isHero) ??
    project.images.find((image) => image.isCover) ??
    project.images[0];

  const gallery = project.images
    .filter((image) => image.id !== heroRow?.id)
    .map((image) => toImageRef(image.mediaAsset, locale, image, title))
    .filter((image): image is ImageRef => image !== null);

  return {
    id: project.id,
    title,
    slug: projectSlug(project, locale),
    status: project.status,
    publishStatus: project.publishStatus,
    isDraft,
    location: pick(locale, project.locationAr, project.locationEn),
    sector: project.sector ? pick(locale, project.sector.nameAr, project.sector.nameEn) : null,
    collection: project.collection
      ? {
          name: pick(locale, project.collection.nameAr, project.collection.nameEn) ?? '',
          slug: project.collection.slug,
        }
      : null,
    year: project.year,
    client: pick(locale, project.clientAr, project.clientEn),
    scope: toParagraphs(pick(locale, project.scopeAr, project.scopeEn)),
    summary: pick(locale, project.shortDescriptionAr, project.shortDescriptionEn),
    description: toParagraphs(pick(locale, project.descriptionAr, project.descriptionEn)),
    hero: heroRow ? toImageRef(heroRow.mediaAsset, locale, heroRow, title) : null,
    gallery,
    seo: {
      title: pick(locale, project.seoTitleAr, project.seoTitleEn),
      description: pick(locale, project.seoDescriptionAr, project.seoDescriptionEn),
      ogImage: project.ogImage ? project.ogImage.storageKey : null,
      canonicalUrl: project.canonicalUrl,
      noIndex: project.noIndex || isDraft,
    },
    slugs: { ar: project.slugAr, en: project.slugEn },
    sectorId: project.sectorId,
    governorateId: project.governorateId,
    collectionId: project.collectionId,
  };
}

/**
 * Related projects: an explicit manual selection wins; otherwise projects that
 * share a collection, sector or governorate are used, in that order.
 */
export async function getRelatedProjects(
  project: ProjectDetail,
  locale: Locale,
  limit = 3,
): Promise<ProjectCard[]> {
  const manual = await prisma.projectRelation.findMany({
    where: { projectId: project.id },
    orderBy: { sortOrder: 'asc' },
    include: { relatedProject: { include: cardInclude } },
    take: limit,
  });

  const picked = manual
    .map((relation) => relation.relatedProject)
    .filter((related) => related.publishStatus === 'PUBLISHED');

  if (picked.length >= limit) {
    return picked.slice(0, limit).map((related) => toCard(related, locale));
  }

  const excludeIds = [project.id, ...picked.map((related) => related.id)];
  const candidates = await prisma.project.findMany({
    where: {
      publishStatus: 'PUBLISHED',
      id: { notIn: excludeIds },
      OR: [
        project.collectionId ? { collectionId: project.collectionId } : {},
        project.sectorId ? { sectorId: project.sectorId } : {},
        project.governorateId ? { governorateId: project.governorateId } : {},
      ].filter((clause) => Object.keys(clause).length > 0),
    },
    include: cardInclude,
    orderBy: [{ featured: 'desc' }, { year: 'desc' }],
    take: limit - picked.length,
  });

  // Still short? Top up with any other published project.
  const combined = [...picked, ...candidates];
  if (combined.length < limit) {
    const filler = await prisma.project.findMany({
      where: {
        publishStatus: 'PUBLISHED',
        id: { notIn: [...excludeIds, ...candidates.map((candidate) => candidate.id)] },
      },
      include: cardInclude,
      orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
      take: limit - combined.length,
    });
    combined.push(...filler);
  }

  return combined.slice(0, limit).map((related) => toCard(related, locale));
}

/** Slugs for both languages — used by the sitemap and the language switcher. */
export async function getAllPublishedProjectSlugs() {
  return prisma.project.findMany({
    where: { publishStatus: 'PUBLISHED' },
    select: { slugAr: true, slugEn: true, updatedAt: true },
  });
}
