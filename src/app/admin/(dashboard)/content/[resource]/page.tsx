import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/guard';
import { getResourceSchema, RESOURCE_KEYS } from '@/lib/admin/resource-schemas';
import { getResourceRepo } from '@/lib/admin/resource-repos';
import { ResourceEditor } from '@/components/admin/ResourceEditor';
import { PageHeading } from '@/components/admin/ui';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource } = await params;
  const schema = getResourceSchema(resource);
  return { title: schema?.title ?? 'Content' };
}

export function generateStaticParams() {
  return RESOURCE_KEYS.map((resource) => ({ resource }));
}

/**
 * One screen serves every simple content list — services, sectors, statistics
 * and so on — driven by the resource registry.
 */
export default async function ResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;

  const schema = getResourceSchema(resource);
  const repo = getResourceRepo(resource);
  if (!schema || !repo) notFound();

  const [rows, user] = await Promise.all([repo.list(), getCurrentUser()]);

  return (
    <>
      <PageHeading
        title={schema.title}
        description={schema.description}
        breadcrumbs={[{ label: 'Content' }, { label: schema.title }]}
      />

      <ResourceEditor schema={schema} rows={rows} canDelete={user?.role === 'ADMIN'} />
    </>
  );
}
