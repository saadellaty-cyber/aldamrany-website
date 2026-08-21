import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { storage } from '@/lib/storage';
import {
  HomepageEditor,
  type FeaturedCandidate,
  type HomepageSectionValues,
} from '@/components/admin/HomepageEditor';
import { FormMessage, PageHeading } from '@/components/admin/ui';
import { getAdminT } from '@/lib/admin/locale';

export const metadata: Metadata = { title: 'Homepage' };

/** Section order and copy hints, matching how the page reads top to bottom. */
const SECTION_META: Array<{
  key: string;
  label: string;
  hint: string;
  supportsImage: boolean;
  supportsSecondaryCta: boolean;
}> = [
  {
    key: 'HERO',
    label: 'Hero — the opening screen',
    hint: 'Full-screen image, headline and the two main buttons.',
    supportsImage: true,
    supportsSecondaryCta: true,
  },
  {
    key: 'ABOUT',
    label: 'Who we are',
    hint: 'Introduction to the company, with a link to the About page.',
    supportsImage: false,
    supportsSecondaryCta: false,
  },
  {
    key: 'STATS',
    label: 'Statistics',
    hint: 'Label above the figures. Edit the figures themselves under Content → Statistics.',
    supportsImage: false,
    supportsSecondaryCta: false,
  },
  {
    key: 'SERVICES',
    label: 'What we do',
    hint: 'Heading for the services list. Edit the services under Content → Services.',
    supportsImage: false,
    supportsSecondaryCta: false,
  },
  {
    key: 'PROJECTS',
    label: 'Our work',
    hint: 'Heading for the featured projects, chosen further down this page.',
    supportsImage: false,
    supportsSecondaryCta: false,
  },
  {
    key: 'QUALITY',
    label: 'Quality & safety',
    hint: 'Dark band summarising the quality and safety approach.',
    supportsImage: true,
    supportsSecondaryCta: false,
  },
  {
    key: 'RISK',
    label: 'Risk management',
    hint: 'Heading for the risk process. Edit the steps under Content → Risk Management.',
    supportsImage: false,
    supportsSecondaryCta: false,
  },
  {
    key: 'CTA',
    label: 'Closing call to action',
    hint: 'The final band, above the footer.',
    supportsImage: false,
    supportsSecondaryCta: false,
  },
];

export default async function HomepageEditorPage() {
  const { t } = await getAdminT();
  const [rows, projects] = await Promise.all([
    prisma.homepageSection.findMany({ include: { image: true } }),
    prisma.project.findMany({
      orderBy: [{ featured: 'desc' }, { featuredOrder: 'asc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        featured: true,
        featuredOrder: true,
        publishStatus: true,
      },
    }),
  ]);

  const byKey = new Map(rows.map((row) => [row.key, row]));

  const sections: HomepageSectionValues[] = SECTION_META.map((meta) => {
    const row = byKey.get(meta.key);
    return {
      key: meta.key,
      label: meta.label,
      hint: meta.hint,
      supportsImage: meta.supportsImage,
      supportsSecondaryCta: meta.supportsSecondaryCta,
      enabled: row?.enabled ?? true,
      eyebrowAr: row?.eyebrowAr ?? null,
      eyebrowEn: row?.eyebrowEn ?? null,
      titleAr: row?.titleAr ?? null,
      titleEn: row?.titleEn ?? null,
      subtitleAr: row?.subtitleAr ?? null,
      subtitleEn: row?.subtitleEn ?? null,
      bodyAr: row?.bodyAr ?? null,
      bodyEn: row?.bodyEn ?? null,
      primaryCtaLabelAr: row?.primaryCtaLabelAr ?? null,
      primaryCtaLabelEn: row?.primaryCtaLabelEn ?? null,
      primaryCtaHref: row?.primaryCtaHref ?? null,
      secondaryCtaLabelAr: row?.secondaryCtaLabelAr ?? null,
      secondaryCtaLabelEn: row?.secondaryCtaLabelEn ?? null,
      secondaryCtaHref: row?.secondaryCtaHref ?? null,
      image: row?.image
        ? {
            id: row.image.id,
            url: storage().url(row.image.storageKey),
            name: row.image.originalName,
          }
        : null,
    };
  });

  const candidates: FeaturedCandidate[] = projects.map((project) => ({
    id: project.id,
    title: project.titleEn || project.titleAr,
    subtitle:
      project.publishStatus === 'PUBLISHED' ? t('Published') : t('Draft — will not appear'),
    featured: project.featured,
  }));

  return (
    <>
      <PageHeading
        title="Homepage"
        description="Everything on the front page of the website is edited here. Changes are live as soon as they are saved."
        breadcrumbs={[{ label: 'Pages' }, { label: 'Homepage' }]}
      />

      <div className="mb-6">
        <FormMessage tone="info">
          {t('Only published projects appear on the homepage. Set the page title and social image under')}{' '}
          <Link href="/admin/pages" className="underline">
            {t('Pages & SEO')}
          </Link>
          .
        </FormMessage>
      </div>

      <HomepageEditor sections={sections} projects={candidates} />
    </>
  );
}
