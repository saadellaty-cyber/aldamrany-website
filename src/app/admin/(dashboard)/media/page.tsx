import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Images } from 'lucide-react';
import { listMediaAssets } from '@/lib/admin/media';
import { MediaUploadPanel } from '@/components/admin/MediaUploadPanel';
import { AdminLinkButton, Badge, EmptyState, PageHeading, Panel, PanelHeader } from '@/components/admin/ui';
import { formatFileSize } from '@/lib/utils';

export const metadata: Metadata = { title: 'Media Library' };

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const page = Number(typeof params.page === 'string' ? params.page : '1') || 1;

  const { items, total, pageCount } = await listMediaAssets({ query, page });

  return (
    <>
      <PageHeading
        title="Media Library"
        description="Upload once, use anywhere. Images can be reused across projects, services and page headers — each usage keeps its own crop."
      />

      <Panel className="mb-6">
        <PanelHeader
          title="Upload images"
          description="Drag files in, or click to browse. Files are checked, resized and optimised automatically."
        />
        <div className="mt-4">
          <MediaUploadPanel />
        </div>
      </Panel>

      <Panel padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e1dc] p-4">
          <p className="text-sm text-ink-muted">
            {total} file{total === 1 ? '' : 's'}
          </p>

          <form method="get" className="flex items-center gap-2">
            <label className="sr-only" htmlFor="media-search">
              Search media
            </label>
            <input
              id="media-search"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search by name, alt text or caption…"
              className="h-9 w-64 max-w-full border border-[#d5d4ce] bg-white px-3 text-sm focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              className="h-9 border border-[#d5d4ce] px-3 text-sm transition-colors hover:border-ink/50"
            >
              Search
            </button>
          </form>
        </div>

        {items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Images className="size-7" aria-hidden="true" />}
              title={query ? 'No matching files' : 'No media uploaded yet'}
              description={
                query
                  ? 'Try a different search term.'
                  : 'Upload photographs of your projects to use them across the website.'
              }
            />
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-px bg-[#e2e1dc] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((asset) => (
              <li key={asset.id} className="bg-white">
                <Link href={`/admin/media/${asset.id}`} className="group block p-2">
                  <span className="relative block aspect-square overflow-hidden bg-[#f2f1ee]">
                    <Image
                      src={asset.url}
                      alt={asset.altEn ?? asset.altAr ?? asset.originalName}
                      fill
                      sizes="(min-width: 1280px) 16vw, (min-width: 640px) 33vw, 50vw"
                      placeholder={asset.blurDataUrl ? 'blur' : 'empty'}
                      blurDataURL={asset.blurDataUrl ?? undefined}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>

                  <span className="mt-2 block truncate text-xs font-medium" title={asset.originalName}>
                    {asset.originalName}
                  </span>

                  <span className="mt-1 flex items-center justify-between gap-2 text-[0.6875rem] text-ink-muted">
                    <span>
                      {asset.width && asset.height ? `${asset.width}×${asset.height}` : '—'} ·{' '}
                      {formatFileSize(asset.fileSize)}
                    </span>
                    {asset.usageCount > 0 ? <Badge tone="accent">{asset.usageCount}</Badge> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {pageCount > 1 ? (
          <nav
            aria-label="Media pages"
            className="flex items-center justify-between gap-3 border-t border-[#e2e1dc] p-4 text-sm"
          >
            <span className="text-ink-muted">
              Page {page} of {pageCount}
            </span>
            <span className="flex gap-2">
              {page > 1 ? (
                <AdminLinkButton
                  variant="secondary"
                  href={`/admin/media?${new URLSearchParams({ q: query, page: String(page - 1) })}`}
                >
                  Previous
                </AdminLinkButton>
              ) : null}
              {page < pageCount ? (
                <AdminLinkButton
                  variant="secondary"
                  href={`/admin/media?${new URLSearchParams({ q: query, page: String(page + 1) })}`}
                >
                  Next
                </AdminLinkButton>
              ) : null}
            </span>
          </nav>
        ) : null}
      </Panel>
    </>
  );
}
