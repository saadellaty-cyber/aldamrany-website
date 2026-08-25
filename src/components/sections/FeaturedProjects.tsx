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
      itemClass="w-[17rem] shrink-0 snap-start md:w-[21rem]"
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          // The 4:3 the gallery uses. It is also close to what the cameras
          // actually shot, so the crop takes very little off the sides.
          ratio="landscape"
          priority={index < 3}
          // Asked for at twice the frame, so the crop stays sharp on the
          // high-density screens most of these are read on.
          sizes="(min-width: 768px) 42rem, 34rem"
        />
      ))}
    </Carousel>
  );
}
