import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { SocialLinksForm, type SocialValues } from '@/components/admin/SocialLinksForm';
import { PageHeading } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'Social Links' };

export default async function SocialLinksPage() {
  const rows = await prisma.socialLink.findMany();

  const values: SocialValues = {
    FACEBOOK: null,
    INSTAGRAM: null,
    LINKEDIN: null,
    YOUTUBE: null,
    TIKTOK: null,
    X: null,
  };

  for (const row of rows) values[row.platform] = row.url;

  return (
    <>
      <PageHeading
        title="Social Links"
        description="Paste the full address of each profile. Empty fields are simply not shown on the website — no placeholder icons appear."
        breadcrumbs={[{ label: 'Configuration' }, { label: 'Social Links' }]}
      />

      <SocialLinksForm values={values} />
    </>
  );
}
