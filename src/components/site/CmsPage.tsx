import { notFound } from 'next/navigation';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/motion/Reveal';
import { getPage, getPageBlocks } from '@/lib/content/pages';
import type { Locale } from '@/i18n/config';

/**
 * Renders a simple prose page straight from the CMS (privacy policy, terms).
 * Unpublished pages 404 rather than showing an empty shell.
 */
export async function CmsPage({ pageKey, locale }: { pageKey: string; locale: Locale }) {
  const [page, blocks] = await Promise.all([
    getPage(pageKey, locale),
    getPageBlocks(pageKey, locale),
  ]);

  if (!page) notFound();

  const hasBody = page.intro.length > 0 || blocks.some((block) => block.body.length > 0);
  if (!hasBody) notFound();

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} image={page.hero} />

      <section className="section-y">
        <div className="container-page">
          <div className="container-prose">
            {page.intro.length > 0 ? (
              <Reveal>
                <div className="prose-editorial lead">
                  {page.intro.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            ) : null}

            {blocks.map((block) => (
              <div key={block.key} className="mt-12">
                {block.title ? (
                  <Reveal>
                    <h2 className="display-4">{block.title}</h2>
                  </Reveal>
                ) : null}
                {block.body.length > 0 ? (
                  <Reveal delay={0.05}>
                    <div className="prose-editorial mt-4 text-paper/55">
                      {block.body.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </Reveal>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
