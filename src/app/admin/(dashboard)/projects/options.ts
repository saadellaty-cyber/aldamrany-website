import { prisma } from '@/lib/db';

/**
 * Reference lists shared by the create and edit screens. Labels show both
 * languages so an Arabic-speaking editor can scan them quickly.
 */
export async function loadProjectOptions(excludeProjectId?: string) {
  const [sectors, governorates, collections, projects] = await Promise.all([
    prisma.sector.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.governorate.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.projectCollection.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.project.findMany({
      where: excludeProjectId ? { NOT: { id: excludeProjectId } } : undefined,
      orderBy: { titleEn: 'asc' },
      select: { id: true, titleAr: true, titleEn: true },
    }),
  ]);

  const bilingual = (ar: string, en: string) => (ar && en ? `${en} — ${ar}` : en || ar);

  return {
    sectors: sectors.map((sector) => ({
      value: sector.id,
      label: bilingual(sector.nameAr, sector.nameEn),
    })),
    governorates: governorates.map((governorate) => ({
      value: governorate.id,
      label: bilingual(governorate.nameAr, governorate.nameEn),
    })),
    collections: collections.map((collection) => ({
      value: collection.id,
      label: bilingual(collection.nameAr, collection.nameEn),
    })),
    otherProjects: projects.map((project) => ({
      value: project.id,
      label: bilingual(project.titleAr, project.titleEn),
    })),
  };
}
