import { Carousel } from '@/components/ui/Carousel';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { ProjectCard as ProjectCardData } from '@/lib/content/projects';

/**
 * The featured projects, as a row that scrolls sideways.
 *
 * A grid of three would drop the fourth and later projects onto a second row
 * that is usually half empty. The row keeps the section one band tall however
 * many are featured, and every tile the same size.
 */
export function FeaturedProjects({
  projects,
  label,
}: {
  projects: ProjectCardData[];
  /** Accessible name for the row. */
  label: string;
}) {
  if (projects.length === 0) return null;

  return (
    <Carousel
      label={label}
      className="mt-12"
      // Wide enough that roughly two sit in view on a desktop: the photograph
      // is the point of this row, and at any smaller size the tiles compete
      // with each other rather than showing anything.
      // The phone size stays put: any wider and a tile fills the track exactly,
      // losing the sliver of the next one that shows the row can be scrolled.
      itemClass="w-[19.5rem] shrink-0 snap-start md:w-[26rem] lg:w-[30rem]"
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          // 5:4 rather than the gallery's 4:3. A road photographed head-on is
          // mostly sky and mostly verge; the wider frame spent that extra width
          // on both and left the machinery small. The taller frame keeps the
          // same road filling more of the tile.
          ratio="classic"
          priority={index < 3}
          // Asked for at twice the frame, so the crop stays sharp on the
          // high-density screens most of these are read on.
          sizes="(min-width: 1024px) 60rem, (min-width: 768px) 52rem, 41rem"
        />
      ))}
    </Carousel>
  );
}
