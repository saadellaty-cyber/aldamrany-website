import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { SmartImage } from '@/components/ui/SmartImage';
import type { ProjectCard as ProjectCardData } from '@/lib/content/projects';
import { cn } from '@/lib/utils';

const RATIOS = {
  tall: 'aspect-[3/4]',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  classic: 'aspect-[5/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  panorama: 'aspect-[21/9]',
} as const;

export type ProjectCardRatio = keyof typeof RATIOS;

/**
 * A project tile: a photograph in a plain frame, with the name and place set
 * beneath it as a caption.
 *
 * The caption sits under the image rather than over it. Laid on top it needed
 * a gradient heavy enough to stay legible against any photograph, which meant
 * darkening the bottom third of every picture to read two lines of text.
 *
 * No shadow, no hover zoom, no scrim — the photograph is the whole of it.
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
    <Link href={project.href} className={cn('group block', className)}>
      <div className={cn('overflow-hidden bg-night-raised', RATIOS[ratio])}>
        <SmartImage
          image={project.image}
          sizes={sizes}
          priority={priority}
          placeholderLabel={project.title}
          placeholderTone="dark"
          className="h-full w-full"
        />
      </div>

      <div className="pt-4">
        <h3 className="text-balance text-base font-semibold leading-snug text-paper transition-colors duration-300 group-hover:text-gold">
          {project.title}
        </h3>

        {project.location ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-paper/60">
            <MapPin className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
            {project.location}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
