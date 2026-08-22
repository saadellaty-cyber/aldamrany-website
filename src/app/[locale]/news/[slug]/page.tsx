import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { NewsList } from '@/components/sections/NewsList';
import { SmartImage } from '@/components/ui/SmartImage';
import { Reveal } from '@/components/motion/Reveal';
import { getNews, getNewsPost } from '@/lib/content/news';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import { isLocale, type Locale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const post = await getNewsPost(slug, locale);
  if (!post) return {};

  return buildMetadata({
    locale,
    path: `/news/${post.slug}`,
    title: post.title,
    description: post.excerpt ?? post.body[0] ?? undefined,
  });
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [t, post] = await Promise.all([getTranslations(), getNewsPost(slug, locale)]);
  if (!post) notFound();

  const others = (await getNews(locale, 4)).filter((item) => item.id !== post.id).slice(0, 3);

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t('news.title'), path: '/news' },
      { name: post.title, path: `/news/${post.slug}` },
    ],
    locale,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />

      <article className="section-y">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <Link
              href={`/${locale}/news`}
              className="group inline-flex items-center gap-2 text-xs text-gold transition-opacity hover:opacity-80"
            >
              <ArrowRight
                className="size-3.5 -scale-x-100 rtl:scale-x-100"
                aria-hidden="true"
              />
              {t('news.back')}
            </Link>

            <time
              dateTime={post.publishedAt.toISOString()}
              className="latin-nums mt-8 block text-xs text-paper/50"
            >
              {formatDate(post.publishedAt, locale)}
            </time>

            <h1 className="mt-3 text-balance text-2xl font-semibold leading-[1.35] text-paper md:text-3xl">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-5 text-base leading-[2] text-paper/70">{post.excerpt}</p>
            ) : null}
          </div>

          {post.image ? (
            <Reveal className="mx-auto mt-10 max-w-4xl">
              <div className="overflow-hidden rounded-[var(--radius-panel)]">
                <div className="aspect-[16/9]">
                  <SmartImage image={post.image} sizes="(min-width: 1024px) 60rem, 100vw" priority className="h-full w-full" />
                </div>
              </div>
            </Reveal>
          ) : null}

          {post.body.length > 0 ? (
            <div className="mx-auto mt-10 max-w-3xl space-y-5 text-sm leading-[2.1] text-paper/70 md:text-base">
              {post.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </div>
      </article>

      {others.length > 0 ? (
        <section className="section-y pt-0 md:pt-0 xl:pt-0">
          <div className="container-page">
            <h2 className="mb-8 text-lg font-semibold tracking-tight text-paper">
              {t('news.title')}
            </h2>
            <NewsList items={others} locale={locale} />
          </div>
        </section>
      ) : null}

      <ContactCTA locale={locale} />
    </>
  );
}
