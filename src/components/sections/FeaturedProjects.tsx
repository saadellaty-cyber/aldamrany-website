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
      itemClass="w-[13.5rem] shrink-0 snap-start md:w-[15.5rem]"
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          ratio="square"
          priority={index < 3}
          sizes="(min-width: 768px) 15.5rem, 13.5rem"
        />
      ))}
    </Carousel>
  );
}
