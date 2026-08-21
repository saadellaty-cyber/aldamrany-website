import { Reveal } from '@/components/motion/Reveal';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { ProjectCard as ProjectCardData } from '@/lib/content/projects';

/**
 * Featured projects in a regular grid.
 *
 * Every tile uses the same 4:3 frame so the section reads as an orderly
 * catalogue: photographs of different shapes are cropped to a common ratio
 * around their focal point rather than being allowed to set their own height.
 */
export function FeaturedProjects({ projects }: { projects: ProjectCardData[] }) {
  if (projects.length === 0) return null;

  return (
    <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
      {projects.map((project, index) => (
        <Reveal key={project.id} delay={(index % 3) * 0.08} distance={36}>
          <ProjectCard
            project={project}
            ratio="landscape"
            priority={index < 3}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </Reveal>
      ))}
    </div>
  );
}
