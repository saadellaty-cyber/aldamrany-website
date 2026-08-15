import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { storage } from '@/lib/storage';
import { PagesEditor, type PageValues } from '@/components/admin/PagesEditor';
import { PageHeading } from '@/components/admin/ui';
import type { MediaAsset } from '@/generated/prisma/client';

export const metadata: Metadata = { title: 'Pages & SEO' };

/** The fixed marketing pages, in the order they appear in the menu. */
const PAGE_META: Array<{ key: string; label: string; path: string; hint: string; blocks: boolean }> = [
  { key: 'home', label: 'Homepage', path: '', hint: 'Title and social image only — the content is edited under Homepage.', blocks: false },
  { key: 'about', label: 'About', path: '/about', hint: 'Header, introduction, and the vision / mission / values blocks.', blocks: true },
  { key: 'services', label: 'Services', path: '/services', hint: 'Header for the services page.', blocks: false },
  { key: 'projects', label: 'Projects', path: '/projects', hint: 'Header for the project archive.', blocks: false },
  { key: 'capabilities', label: 'Capabilities', path: '/capabilities', hint: 'Header for the capabilities page.', blocks: false },
  { key: 'quality-safety', label: 'Quality & Safety', path: '/quality-safety', hint: 'Header and introduction.', blocks: false },
  { key: 'risk-management', label: 'Risk Management', path: '/risk-management', hint: 'Header and introduction.', blocks: false },
  { key: 'sectors', label: 'Sectors', path: '/sectors', hint: 'Header for the sectors page.', blocks: false },
  { key: 'contact', label: 'Contact', path: '/contact', hint: 'Header for the contact page.', blocks: false },
  { key: 'privacy', label: 'Privacy Policy', path: '/privacy', hint: 'Publish once the text has been written — it then appears in the footer.', blocks: true },
  { key: 'terms', label: 'Terms & Conditions', path: '/terms', hint: 'Publish once the text has been written — it then appears in the footer.', blocks: true },
];

function toImage(asset: MediaAsset | null) {
  return asset
    ? { id: asset.id, url: storage().url(asset.storageKey), name: asset.originalName }
    : null;
}

export default async function PagesSeoPage() {
  const rows = await prisma.page.findMany({
    include: {
      heroImage: true,
      ogImage: true,
      blocks: { orderBy: { sortOrder: 'asc' }, include: { image: true } },
    },
  });

  const byKey = new Map(rows.map((row) => [row.key, row]));

  const pages: PageValues[] = PAGE_META.map((meta) => {
    const row = byKey.get(meta.key);
    return {
      key: meta.key,
      label: meta.label,
      path: meta.path,
      hint: meta.hint,
      supportsBlocks: meta.blocks,
      status: row?.status ?? 'PUBLISHED',
      eyebrowAr: row?.eyebrowAr ?? null,
      eyebrowEn: row?.eyebrowEn ?? null,
      titleAr: row?.titleAr ?? null,
      titleEn: row?.titleEn ?? null,
      introAr: row?.introAr ?? null,
      introEn: row?.introEn ?? null,
      seoTitleAr: row?.seoTitleAr ?? null,
      seoTitleEn: row?.seoTitleEn ?? null,
      seoDescriptionAr: row?.seoDescriptionAr ?? null,
      seoDescriptionEn: row?.seoDescriptionEn ?? null,
      canonicalUrl: row?.canonicalUrl ?? null,
      noIndex: row?.noIndex ?? false,
      heroImage: toImage(row?.heroImage ?? null),
      ogImage: toImage(row?.ogImage ?? null),
      blocks:
        row?.blocks.map((block) => ({
          id: block.id,
          key: block.key,
          titleAr: block.titleAr,
          titleEn: block.titleEn,
          bodyAr: block.bodyAr,
          bodyEn: block.bodyEn,
          status: block.status,
          image: toImage(block.image),
        })) ?? [],
    };
  });

  return (
    <>
      <PageHeading
        title="Pages & SEO"
        description="Headers, introductions and search-engine settings for each fixed page of the website."
        breadcrumbs={[{ label: 'Pages' }, { label: 'Pages & SEO' }]}
      />

      <PagesEditor pages={pages} />
    </>
  );
}
