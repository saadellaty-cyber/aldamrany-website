import { Reveal } from '@/components/motion/Reveal';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { ProjectCard as ProjectCardData } from '@/lib/content/projects';

/**
 * Asymmetric editorial arrangement: one dominant project, a pair beneath it,
 * then a full-width band — repeating for longer selections so the rhythm never
 * collapses into a uniform grid.
 */
export function FeaturedProjects({ projects }: { projects: ProjectCardData[] }) {
  if (projects.length === 0) return null;

  const [lead, ...rest] = projects;
  const pair = rest.slice(0, 2);
  const wide = rest.slice(2, 3);
  const remainder = rest.slice(3);

  return (
    <div className="mt-14 flex flex-col gap-14 md:gap-20">
      <Reveal distance={40}>
        <ProjectCard
          project={lead}
          ratio="wide"
          titleClass="display-2"
          sizes="(min-width: 1280px) 1280px, 100vw"
        />
      </Reveal>

      {pair.length > 0 ? (
        <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
          {pair.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.1} distance={40}>
              <ProjectCard
                project={project}
                ratio={index === 0 ? 'portrait' : 'landscape'}
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </Reveal>
          ))}
        </div>
      ) : null}

      {wide.map((project) => (
        <Reveal key={project.id} distance={40}>
          <ProjectCard
            project={project}
            ratio="panorama"
            titleClass="display-3"
            sizes="(min-width: 1280px) 1280px, 100vw"
          />
        </Reveal>
      ))}

      {remainder.length > 0 ? (
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {remainder.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.08} distance={40}>
              <ProjectCard
                project={project}
                ratio="landscape"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            </Reveal>
          ))}
        </div>
      ) : null}
    </div>
  );
}
