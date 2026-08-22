import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { getAllPublishedProjectSlugs } from '@/lib/content/projects';
import { getSiteSettings } from '@/lib/content/site';
import { env } from '@/lib/env';
import { locales } from '@/i18n/config';

export const dynamic = 'force-dynamic';

/** Marketing routes that always exist, with their relative priority. */
const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: 'weekly' | 'monthly' }> = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/services', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/projects', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/capabilities', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/quality-safety', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/risk-management', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/sectors', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/news', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  if (settings.maintenanceMode) return [];

  const [projects, legalPages, news] = await Promise.all([
    getAllPublishedProjectSlugs(),
    prisma.page.findMany({
      where: { key: { in: ['privacy', 'terms'] }, status: 'PUBLISHED' },
      select: { key: true, updatedAt: true },
    }),
    prisma.newsPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const alternates = (path: (locale: string) => string) => ({
    languages: Object.fromEntries(
      locales.map((locale) => [locale, `${env.siteUrl}/${locale}${path(locale)}`]),
    ),
  });

  for (const route of STATIC_ROUTES) {
    for (const locale of locales) {
      entries.push({
        url: `${env.siteUrl}/${locale}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: alternates(() => route.path),
      });
    }
  }

  for (const page of legalPages) {
    for (const locale of locales) {
      entries.push({
        url: `${env.siteUrl}/${locale}/${page.key}`,
        lastModified: page.updatedAt,
        changeFrequency: 'yearly',
        priority: 0.2,
        alternates: alternates(() => `/${page.key}`),
      });
    }
  }

  // Each project is listed under its own language-specific slug.
  for (const project of projects) {
    for (const locale of locales) {
      const slug = locale === 'ar' ? project.slugAr : project.slugEn;
      entries.push({
        url: `${env.siteUrl}/${locale}/projects/${encodeURIComponent(slug)}`,
        lastModified: project.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: alternates((target) =>
          `/projects/${encodeURIComponent(target === 'ar' ? project.slugAr : project.slugEn)}`,
        ),
      });
    }
  }

  // News shares one slug across both languages.
  for (const post of news) {
    for (const locale of locales) {
      entries.push({
        url: `/${locale}/news/${encodeURIComponent(post.slug)}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: alternates(() => `/news/${encodeURIComponent(post.slug)}`),
      });
    }
  }

  return entries;
}
