import type { Metadata } from 'next';
import { ProjectEditor, type ProjectFormValues } from '@/components/admin/ProjectEditor';
import { loadProjectOptions } from '@/app/admin/(dashboard)/projects/options';
import { FormMessage, PageHeading } from '@/components/admin/ui';
import { getAdminT } from '@/lib/admin/locale';

export const metadata: Metadata = { title: 'New project' };

const EMPTY: ProjectFormValues = {
  titleAr: '',
  titleEn: '',
  slugAr: '',
  slugEn: '',
  shortDescriptionAr: null,
  shortDescriptionEn: null,
  descriptionAr: null,
  descriptionEn: null,
  locationAr: null,
  locationEn: null,
  clientAr: null,
  clientEn: null,
  scopeAr: null,
  scopeEn: null,
  year: null,
  status: null,
  governorateId: null,
  sectorId: null,
  collectionId: null,
  featured: false,
  featuredOrder: null,
  publishStatus: 'DRAFT',
  seoTitleAr: null,
  seoTitleEn: null,
  seoDescriptionAr: null,
  seoDescriptionEn: null,
  canonicalUrl: null,
  noIndex: false,
  ogImage: null,
  relatedProjectIds: [],
};

export default async function NewProjectPage() {
  const [options, { t }] = await Promise.all([loadProjectOptions(), getAdminT()]);

  return (
    <>
      <PageHeading
        title="New project"
        description="Enter what you know and save a draft. Photographs can be added as soon as the project is saved."
        breadcrumbs={[{ label: 'Projects', href: '/admin/projects' }, { label: 'New' }]}
      />

      <div className="mb-6">
        <FormMessage tone="info">
          {t(
            'Save the project first — the photo gallery, hero selection and image cropping become available once it exists.',
          )}
        </FormMessage>
      </div>

      <ProjectEditor
        mode="create"
        values={EMPTY}
        sectors={options.sectors}
        governorates={options.governorates}
        collections={options.collections}
        otherProjects={[]}
      />
    </>
  );
}
