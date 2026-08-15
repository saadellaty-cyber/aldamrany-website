import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CmsPage } from '@/components/site/CmsPage';
import { getPage } from '@/lib/content/pages';
import { buildMetadata } from '@/lib/seo';
import { isLocale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('terms', locale);
  return buildMetadata({
    locale,
    path: '/terms',
    title: page?.seo.title ?? page?.title,
    description: page?.seo.description,
    noIndex: page?.seo.noIndex,
  });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return <CmsPage pageKey="terms" locale={locale} />;
}
