import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { storage } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth/guard';
import { ProjectEditor, type ProjectFormValues } from '@/components/admin/ProjectEditor';
import { GalleryManager, type GalleryImage } from '@/components/admin/GalleryManager';
import { loadProjectOptions } from '@/app/admin/(dashboard)/projects/options';
import { duplicateProject } from '@/app/admin/(dashboard)/projects/actions';
import { DeleteProjectButton } from '@/components/admin/DeleteProjectButton';
import {
  AdminButton,
  FormMessage,
  PageHeading,
  Panel,
  PanelHeader,
  StatusBadge,
} from '@/components/admin/ui';

export const metadata: Metadata = { title: 'Edit project' };

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      ogImage: true,
      relatedTo: { orderBy: { sortOrder: 'asc' }, select: { relatedProjectId: true } },
      images: {
        orderBy: { sortOrder: 'asc' },
        include: { mediaAsset: true },
      },
    },
  });

  if (!project) notFound();

  const [options, user] = await Promise.all([loadProjectOptions(project.id), getCurrentUser()]);

  const values: ProjectFormValues = {
    id: project.id,
    titleAr: project.titleAr,
    titleEn: project.titleEn,
    slugAr: project.slugAr,
    slugEn: project.slugEn,
    shortDescriptionAr: project.shortDescriptionAr,
    shortDescriptionEn: project.shortDescriptionEn,
    descriptionAr: project.descriptionAr,
    descriptionEn: project.descriptionEn,
    locationAr: project.locationAr,
    locationEn: project.locationEn,
    clientAr: project.clientAr,
    clientEn: project.clientEn,
    scopeAr: project.scopeAr,
    scopeEn: project.scopeEn,
    year: project.year,
    status: project.status,
    governorateId: project.governorateId,
    sectorId: project.sectorId,
    collectionId: project.collectionId,
    featured: project.featured,
    featuredOrder: project.featuredOrder,
    publishStatus: project.publishStatus,
    seoTitleAr: project.seoTitleAr,
    seoTitleEn: project.seoTitleEn,
    seoDescriptionAr: project.seoDescriptionAr,
    seoDescriptionEn: project.seoDescriptionEn,
    canonicalUrl: project.canonicalUrl,
    noIndex: project.noIndex,
    ogImage: project.ogImage
      ? {
          id: project.ogImage.id,
          url: storage().url(project.ogImage.storageKey),
          name: project.ogImage.originalName,
        }
      : null,
    relatedProjectIds: project.relatedTo.map((relation) => relation.relatedProjectId),
  };

  const images: GalleryImage[] = project.images.map((image) => ({
    id: image.id,
    mediaAssetId: image.mediaAssetId,
    url: storage().url(image.mediaAsset.storageKey),
    name: image.mediaAsset.originalName,
    isHero: image.isHero,
    isCover: image.isCover,
    focalX: image.focalX ?? image.mediaAsset.focalX,
    focalY: image.focalY ?? image.mediaAsset.focalY,
    mobileFocalX: image.mobileFocalX ?? image.mediaAsset.mobileFocalX,
    mobileFocalY: image.mobileFocalY ?? image.mediaAsset.mobileFocalY,
    altTextAr: image.altTextAr,
    altTextEn: image.altTextEn,
    captionAr: image.captionAr,
    captionEn: image.captionEn,
  }));

  const previewUrl = `/ar/projects/${encodeURIComponent(project.slugAr)}?preview=${project.previewToken}`;
  const publicUrl = `/ar/projects/${encodeURIComponent(project.slugAr)}`;

  return (
    <>
      <PageHeading
        title={project.titleEn || project.titleAr}
        breadcrumbs={[{ label: 'Projects', href: '/admin/projects' }, { label: 'Edit' }]}
        action={<StatusBadge status={project.publishStatus} />}
      />

      {query.created ? (
        <div className="mb-6">
          <FormMessage tone="success">
            Project created. You can now add photographs below.
          </FormMessage>
        </div>
      ) : null}

      {query.duplicated ? (
        <div className="mb-6">
          <FormMessage tone="success">
            Project duplicated as a draft. Review the details before publishing.
          </FormMessage>
        </div>
      ) : null}

      <div className="mb-6">
        <GalleryManager projectId={project.id} images={images} />
      </div>

      <ProjectEditor
        mode="edit"
        values={values}
        sectors={options.sectors}
        governorates={options.governorates}
        collections={options.collections}
        otherProjects={options.otherProjects}
        previewUrl={previewUrl}
        publicUrl={publicUrl}
      />

      <Panel className="mt-8 space-y-4">
        <PanelHeader
          title="Other actions"
          description="Duplicating creates a draft copy, including the gallery. Deleting cannot be undone; the photographs stay in the media library."
        />
        <div className="flex flex-wrap gap-3">
          <form action={duplicateProject}>
            <input type="hidden" name="id" value={project.id} />
            <AdminButton type="submit" variant="secondary">
              Duplicate project
            </AdminButton>
          </form>

          {user?.role === 'ADMIN' ? <DeleteProjectButton projectId={project.id} /> : null}
        </div>
      </Panel>
    </>
  );
}
