import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getMediaAsset, getMediaUsage } from '@/lib/admin/media';
import { getCurrentUser } from '@/lib/auth/guard';
import { MediaDetailForm } from '@/app/admin/(dashboard)/media/[id]/MediaDetailForm';
import { DeleteMediaForm } from '@/app/admin/(dashboard)/media/[id]/DeleteMediaForm';
import { MediaUploadPanel } from '@/components/admin/MediaUploadPanel';
import { PageHeading, Panel, PanelHeader } from '@/components/admin/ui';
import { formatDateTime, formatFileSize } from '@/lib/utils';

export const metadata: Metadata = { title: 'Media' };

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [asset, usage, user] = await Promise.all([
    getMediaAsset(id),
    getMediaUsage(id),
    getCurrentUser(),
  ]);

  if (!asset) notFound();

  const facts = [
    { label: 'File name', value: asset.originalName },
    { label: 'Type', value: asset.mimeType },
    { label: 'Size', value: formatFileSize(asset.fileSize) },
    {
      label: 'Dimensions',
      value: asset.width && asset.height ? `${asset.width} × ${asset.height} px` : 'Unknown',
    },
    { label: 'Uploaded', value: formatDateTime(asset.createdAt, 'en') },
    { label: 'Used in', value: `${asset.usageCount} place${asset.usageCount === 1 ? '' : 's'}` },
  ];

  return (
    <>
      <PageHeading
        title={asset.originalName}
        breadcrumbs={[
          { label: 'Media Library', href: '/admin/media' },
          { label: 'File' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MediaDetailForm asset={asset} />
        </div>

        <div className="space-y-6">
          <Panel>
            <PanelHeader title="Preview" />
            <div className="relative mt-4 aspect-square w-full overflow-hidden border border-[#e2e1dc] bg-[#f2f1ee]">
              <Image
                src={asset.url}
                alt={asset.altEn ?? asset.originalName}
                fill
                sizes="(min-width: 1280px) 30vw, 100vw"
                className="object-contain"
              />
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Details" />
            <dl className="mt-4 space-y-2.5 text-sm">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between gap-4">
                  <dt className="shrink-0 text-ink-muted">{fact.label}</dt>
                  <dd className="min-w-0 break-words text-end font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel>
            <PanelHeader
              title="Replace file"
              description="Upload a new file to replace this one everywhere it is used. Alt text, captions and crops are kept."
            />
            <div className="mt-4">
              <MediaUploadPanel
                replaceId={asset.id}
                multiple={false}
                compact
                label="Choose a replacement image"
              />
            </div>
          </Panel>

          {user?.role === 'ADMIN' ? (
            <Panel>
              <PanelHeader title="Delete" />
              <div className="mt-4">
                <DeleteMediaForm id={asset.id} usage={usage} />
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}
