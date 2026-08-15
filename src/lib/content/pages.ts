import { cache } from 'react';
import { prisma } from '@/lib/db';
import { toImageRef, type ImageRef } from '@/lib/content/media';
import { pick, type Locale } from '@/i18n/config';
import { toLines, toParagraphs } from '@/lib/utils';

export type PageContent = {
  key: string;
  eyebrow: string | null;
  title: string | null;
  intro: string[];
  hero: ImageRef | null;
  seo: {
    title: string | null;
    description: string | null;
    ogImageKey: string | null;
    canonicalUrl: string | null;
    noIndex: boolean;
  };
};

/**
 * Editable hero copy and SEO for a fixed marketing page. Returns null when the
 * row is missing or unpublished so the caller can fall back to defaults.
 */
export const getPage = cache(async (key: string, locale: Locale): Promise<PageContent | null> => {
  const page = await prisma.page.findUnique({
    where: { key },
    include: { heroImage: true, ogImage: true },
  });

  if (!page || page.status !== 'PUBLISHED') return null;

  const title = pick(locale, page.titleAr, page.titleEn);

  return {
    key: page.key,
    eyebrow: pick(locale, page.eyebrowAr, page.eyebrowEn),
    title,
    intro: toParagraphs(pick(locale, page.introAr, page.introEn)),
    hero: toImageRef(page.heroImage, locale, {}, title ?? ''),
    seo: {
      title: pick(locale, page.seoTitleAr, page.seoTitleEn),
      description: pick(locale, page.seoDescriptionAr, page.seoDescriptionEn),
      ogImageKey: page.ogImage?.storageKey ?? null,
      canonicalUrl: page.canonicalUrl,
      noIndex: page.noIndex,
    },
  };
});

export type Block = {
  key: string;
  title: string | null;
  body: string[];
  /** Same body split by single newlines, for blocks rendered as lists. */
  lines: string[];
  icon: string | null;
  image: ImageRef | null;
};

export const getPageBlocks = cache(async (pageKey: string, locale: Locale): Promise<Block[]> => {
  const blocks = await prisma.contentBlock.findMany({
    where: { pageKey, status: 'PUBLISHED' },
    include: { image: true },
    orderBy: { sortOrder: 'asc' },
  });

  return blocks.map((block) => {
    const body = pick(locale, block.bodyAr, block.bodyEn);
    const title = pick(locale, block.titleAr, block.titleEn);
    return {
      key: block.key,
      title,
      body: toParagraphs(body),
      lines: toLines(body),
      icon: block.icon,
      image: toImageRef(block.image, locale, {}, title ?? ''),
    };
  });
});

/** Convenience lookup for a single named block, e.g. `vision` on the about page. */
export function findBlock(blocks: Block[], key: string): Block | null {
  return blocks.find((block) => block.key === key) ?? null;
}
