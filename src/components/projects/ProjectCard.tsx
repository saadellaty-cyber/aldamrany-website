import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SmartImage } from '@/components/ui/SmartImage';
import type { ProjectCard as ProjectCardData } from '@/lib/content/projects';
import { cn } from '@/lib/utils';

const RATIOS = {
  tall: 'aspect-[3/4]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  panorama: 'aspect-[21/9]',
} as const;

export type ProjectCardRatio = keyof typeof RATIOS;

/**
 * Editorial project tile: image, then a meta line and title beneath it.
 * The whole card is one link, with the image scaling gently on hover.
 */
export async function ProjectCard({
  project,
  ratio = 'landscape',
  sizes,
  titleClass = 'display-4',
  priority = false,
  className,
}: {
  project: ProjectCardData;
  ratio?: ProjectCardRatio;
  sizes: string;
  titleClass?: string;
  priority?: boolean;
  className?: string;
}) {
  const t = await getTranslations();

  const meta = [
    project.location,
    project.sector,
    project.year ? String(project.year) : null,
    project.status ? t(`projectStatus.${project.status}`) : null,
  ].filter(Boolean) as string[];

  return (
    <Link href={project.href} className={cn('group block', className)}>
      <div className={cn('relative overflow-hidden bg-paper-soft', RATIOS[ratio])}>
        <SmartImage
          image={project.image}
          sizes={sizes}
          priority={priority}
          placeholderLabel={project.title}
          className="h-full w-full"
          imageClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/15"
        />

        <span
          aria-hidden="true"
          className="absolute bottom-0 end-0 flex size-12 translate-y-full items-center justify-center bg-paper text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
        >
          <ArrowRight className="size-4 rtl:-scale-x-100" />
        </span>
      </div>

      <div className="mt-5">
        {meta.length > 0 ? (
          <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-muted">
            {meta.map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-3">
                {index > 0 ? (
                  <span aria-hidden="true" className="inline-block size-1 bg-current opacity-40" />
                ) : null}
                {item}
              </span>
            ))}
          </p>
        ) : null}

        <h3 className={cn('mt-3 text-balance transition-opacity duration-300 group-hover:opacity-70', titleClass)}>
          {project.title}
        </h3>

        {project.summary ? (
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-muted">
            {project.summary}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
