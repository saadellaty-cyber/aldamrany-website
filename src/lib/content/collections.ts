import { cache } from 'react';
import { prisma } from '@/lib/db';
import { toImageRef, type ImageRef } from '@/lib/content/media';
import { pick, type Locale } from '@/i18n/config';
import { toParagraphs } from '@/lib/utils';
import type { QualityCategory } from '@/generated/prisma/enums';

/** Editable homepage band, addressed by key (HERO, ABOUT, PROJECTS…). */
export type HomeSection = {
  key: string;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string[];
  image: ImageRef | null;
  primaryCta: { label: string; href: string } | null;
  secondaryCta: { label: string; href: string } | null;
};

function cta(
  label: string | null,
  href: string | null,
  locale: Locale,
): { label: string; href: string } | null {
  if (!label || !href) return null;
  const isExternal = /^https?:\/\//i.test(href);
  return { label, href: isExternal ? href : `/${locale}${href.startsWith('/') ? href : `/${href}`}` };
}

export const getHomeSections = cache(
  async (locale: Locale): Promise<Record<string, HomeSection>> => {
    const rows = await prisma.homepageSection.findMany({
      where: { enabled: true },
      include: { image: true },
      orderBy: { sortOrder: 'asc' },
    });

    const sections: Record<string, HomeSection> = {};
    for (const row of rows) {
      const title = pick(locale, row.titleAr, row.titleEn);
      sections[row.key] = {
        key: row.key,
        eyebrow: pick(locale, row.eyebrowAr, row.eyebrowEn),
        title,
        subtitle: pick(locale, row.subtitleAr, row.subtitleEn),
        body: toParagraphs(pick(locale, row.bodyAr, row.bodyEn)),
        image: toImageRef(row.image, locale, {}, title ?? ''),
        primaryCta: cta(
          pick(locale, row.primaryCtaLabelAr, row.primaryCtaLabelEn),
          row.primaryCtaHref,
          locale,
        ),
        secondaryCta: cta(
          pick(locale, row.secondaryCtaLabelAr, row.secondaryCtaLabelEn),
          row.secondaryCtaHref,
          locale,
        ),
      };
    }
    return sections;
  },
);

export type Stat = { id: string; label: string; value: string; prefix: string | null; suffix: string | null };

/** Statistics without a value are dropped — an empty figure is never rendered. */
export const getStatistics = cache(async (locale: Locale): Promise<Stat[]> => {
  const rows = await prisma.statistic.findMany({
    where: { status: 'PUBLISHED', NOT: { value: null } },
    orderBy: { sortOrder: 'asc' },
  });

  return rows
    .filter((row) => Boolean(row.value?.trim()))
    .map((row) => ({
      id: row.id,
      label: pick(locale, row.labelAr, row.labelEn) ?? '',
      value: row.value!.trim(),
      prefix: row.prefix,
      suffix: row.suffix,
    }));
});

export type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  description: string[];
  image: ImageRef | null;
  icon: string | null;
};

export const getServices = cache(
  async (locale: Locale, options: { featuredOnly?: boolean } = {}): Promise<ServiceItem[]> => {
    const rows = await prisma.service.findMany({
      where: { status: 'PUBLISHED', ...(options.featuredOnly ? { featured: true } : {}) },
      include: { image: true },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((row) => {
      const title = pick(locale, row.titleAr, row.titleEn) ?? '';
      return {
        id: row.id,
        slug: row.slug,
        title,
        description: toParagraphs(pick(locale, row.descriptionAr, row.descriptionEn)),
        image: toImageRef(row.image, locale, {}, title),
        icon: row.icon,
      };
    });
  },
);

export type SectorItem = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string[];
  image: ImageRef | null;
  projectCount: number;
};

export const getSectors = cache(async (locale: Locale): Promise<SectorItem[]> => {
  const rows = await prisma.sector.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      image: true,
      _count: { select: { projects: { where: { publishStatus: 'PUBLISHED' } } } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return rows.map((row) => {
    const name = pick(locale, row.nameAr, row.nameEn) ?? '';
    return {
      id: row.id,
      slug: row.slug,
      name,
      icon: row.icon,
      description: toParagraphs(pick(locale, row.descriptionAr, row.descriptionEn)),
      image: toImageRef(row.image, locale, {}, name),
      projectCount: row._count.projects,
    };
  });
});

export type CapabilityItem = {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
  description: string[];
  image: ImageRef | null;
};

export const getCapabilities = cache(async (locale: Locale): Promise<CapabilityItem[]> => {
  const rows = await prisma.capability.findMany({
    where: { status: 'PUBLISHED' },
    include: { image: true },
    orderBy: { sortOrder: 'asc' },
  });

  return rows.map((row) => {
    const title = pick(locale, row.titleAr, row.titleEn) ?? '';
    return {
      id: row.id,
      slug: row.slug,
      title,
      icon: row.icon,
      description: toParagraphs(pick(locale, row.descriptionAr, row.descriptionEn)),
      image: toImageRef(row.image, locale, {}, title),
    };
  });
});

export type QualityItem = {
  id: string;
  slug: string;
  category: QualityCategory;
  title: string;
  icon: string | null;
  body: string[];
  image: ImageRef | null;
};

export const getQualitySections = cache(async (locale: Locale): Promise<QualityItem[]> => {
  const rows = await prisma.qualitySection.findMany({
    where: { status: 'PUBLISHED' },
    include: { image: true },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });

  return rows.map((row) => {
    const title = pick(locale, row.titleAr, row.titleEn) ?? '';
    return {
      id: row.id,
      slug: row.slug,
      category: row.category,
      title,
      icon: row.icon,
      body: toParagraphs(pick(locale, row.bodyAr, row.bodyEn)),
      image: toImageRef(row.image, locale, {}, title),
    };
  });
});

export type RiskStep = {
  id: string;
  step: string;
  title: string;
  description: string[];
  image: ImageRef | null;
};

export const getRiskItems = cache(async (locale: Locale): Promise<RiskStep[]> => {
  const rows = await prisma.riskItem.findMany({
    where: { status: 'PUBLISHED' },
    include: { image: true },
    orderBy: [{ sortOrder: 'asc' }, { stepNumber: 'asc' }],
  });

  return rows.map((row) => {
    const title = pick(locale, row.titleAr, row.titleEn) ?? '';
    return {
      id: row.id,
      step: String(row.stepNumber).padStart(2, '0'),
      title,
      description: toParagraphs(pick(locale, row.descriptionAr, row.descriptionEn)),
      image: toImageRef(row.image, locale, {}, title),
    };
  });
});

export type TimelineEntry = {
  id: string;
  year: number;
  title: string | null;
  description: string[];
  image: ImageRef | null;
};

export const getTimeline = cache(async (locale: Locale): Promise<TimelineEntry[]> => {
  const rows = await prisma.timelineItem.findMany({
    where: { status: 'PUBLISHED' },
    include: { image: true },
    orderBy: [{ year: 'asc' }, { sortOrder: 'asc' }],
  });

  return rows.map((row) => ({
    id: row.id,
    year: row.year,
    title: pick(locale, row.titleAr, row.titleEn),
    description: toParagraphs(pick(locale, row.descriptionAr, row.descriptionEn)),
    image: toImageRef(row.image, locale, {}, String(row.year)),
  }));
});

export type CollectionItem = {
  id: string;
  slug: string;
  name: string;
  description: string[];
  projectCount: number;
  image: ImageRef | null;
};

export const getProjectCollections = cache(async (locale: Locale): Promise<CollectionItem[]> => {
  const rows = await prisma.projectCollection.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      coverImage: true,
      _count: { select: { projects: { where: { publishStatus: 'PUBLISHED' } } } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return rows.map((row) => {
    const name = pick(locale, row.nameAr, row.nameEn) ?? '';
    return {
      id: row.id,
      slug: row.slug,
      name,
      description: toParagraphs(pick(locale, row.descriptionAr, row.descriptionEn)),
      projectCount: row._count.projects,
      image: toImageRef(row.coverImage, locale, {}, name),
    };
  });
});
