import { cache } from 'react';
import { prisma } from '@/lib/db';
import { toImageRef, type ImageRef } from '@/lib/content/media';
import { pick, type Locale } from '@/i18n/config';
import { toParagraphs } from '@/lib/utils';

export type NewsCard = {
  id: string;
  slug: string;
  href: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date;
  image: ImageRef | null;
};

export type NewsPostDetail = NewsCard & {
  body: string[];
};

/**
 * Published news, newest first.
 *
 * A post with no title in either language is skipped rather than rendered as
 * an empty card — the same rule the rest of the content loaders follow.
 */
export const getNews = cache(async (locale: Locale, limit?: number): Promise<NewsCard[]> => {
  const rows = await prisma.newsPost.findMany({
    where: { status: 'PUBLISHED' },
    include: { image: true },
    orderBy: { publishedAt: 'desc' },
    ...(limit ? { take: limit } : {}),
  });

  return rows
    .map((row) => {
      const title = pick(locale, row.titleAr, row.titleEn);
      if (!title) return null;

      return {
        id: row.id,
        slug: row.slug,
        href: `/${locale}/news/${row.slug}`,
        title,
        excerpt: pick(locale, row.excerptAr, row.excerptEn),
        publishedAt: row.publishedAt,
        image: toImageRef(row.image, locale, {}, title),
      };
    })
    .filter(Boolean) as NewsCard[];
});

export const getNewsPost = cache(
  async (slug: string, locale: Locale): Promise<NewsPostDetail | null> => {
    const row = await prisma.newsPost.findUnique({
      where: { slug },
      include: { image: true },
    });

    if (!row || row.status !== 'PUBLISHED') return null;

    const title = pick(locale, row.titleAr, row.titleEn);
    if (!title) return null;

    return {
      id: row.id,
      slug: row.slug,
      href: `/${locale}/news/${row.slug}`,
      title,
      excerpt: pick(locale, row.excerptAr, row.excerptEn),
      publishedAt: row.publishedAt,
      image: toImageRef(row.image, locale, {}, title),
      body: toParagraphs(pick(locale, row.bodyAr, row.bodyEn)),
    };
  },
);

export type PartnerItem = {
  id: string;
  name: string;
  url: string | null;
  logo: ImageRef;
};

/**
 * Partners that actually have a logo uploaded. A strip of empty boxes reads
 * worse than no strip, so partners without one are dropped here rather than
 * rendered as a placeholder.
 */
export const getPartners = cache(async (locale: Locale): Promise<PartnerItem[]> => {
  const rows = await prisma.partner.findMany({
    where: { status: 'PUBLISHED', NOT: { logoId: null } },
    include: { logo: true },
    orderBy: { sortOrder: 'asc' },
  });

  return rows
    .map((row) => {
      const name = pick(locale, row.nameAr, row.nameEn) ?? '';
      const logo = toImageRef(row.logo, locale, {}, name);
      if (!logo) return null;

      return { id: row.id, name, url: row.url, logo };
    })
    .filter(Boolean) as PartnerItem[];
});
