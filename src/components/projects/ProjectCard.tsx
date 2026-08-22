import Link from 'next/link';
import { MapPin } from 'lucide-react';
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
 * A project tile: the photograph carries the card, with the name and place
 * laid over its foot.
 *
 * Caption under the image would push the titles onto different lines whenever
 * a name runs long, so a row of tiles never lines up. Laying the text over the
 * image keeps every card the same height, and the gradient behind it is dark
 * enough that the name stays legible over any photograph.
 */
export function ProjectCard({
  project,
  ratio = 'landscape',
  sizes,
  priority = false,
  className,
}: {
  project: ProjectCardData;
  ratio?: ProjectCardRatio;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={project.href}
      className={cn(
        'group relative block overflow-hidden rounded-[var(--radius-card)] border border-night-line bg-night-raised',
        RATIOS[ratio],
        className,
      )}
    >
      <SmartImage
        image={project.image}
        sizes={sizes}
        priority={priority}
        placeholderLabel={project.title}
        placeholderTone="dark"
        className="h-full w-full"
        imageClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-balance text-base font-semibold leading-snug text-paper">
          {project.title}
        </h3>

        {project.location ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-paper/70">
            <MapPin className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
            {project.location}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
