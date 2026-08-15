import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FolderKanban, Star } from 'lucide-react';
import { prisma } from '@/lib/db';
import { storage } from '@/lib/storage';
import {
  AdminLinkButton,
  Badge,
  EmptyState,
  PageHeading,
  Panel,
  StatusBadge,
  TableWrap,
  Td,
  Th,
} from '@/components/admin/ui';
import { formatDateTime } from '@/lib/utils';
import type { Prisma } from '@/generated/prisma/client';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const statusFilter = typeof params.status === 'string' ? params.status : '';
  const featuredOnly = params.featured === '1';
  const query = typeof params.q === 'string' ? params.q.trim() : '';

  const where: Prisma.ProjectWhereInput = {
    ...(statusFilter === 'DRAFT' || statusFilter === 'PUBLISHED'
      ? { publishStatus: statusFilter }
      : {}),
    ...(featuredOnly ? { featured: true } : {}),
    ...(query
      ? {
          OR: [
            { titleAr: { contains: query, mode: 'insensitive' } },
            { titleEn: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const projects = await prisma.project.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }],
    include: {
      sector: { select: { nameEn: true, nameAr: true } },
      _count: { select: { images: true } },
      images: {
        where: { OR: [{ isCover: true }, { isHero: true }] },
        orderBy: [{ isCover: 'desc' }, { isHero: 'desc' }],
        take: 1,
        include: { mediaAsset: { select: { storageKey: true, blurDataUrl: true } } },
      },
    },
  });

  const filters = [
    { label: 'All', href: '/admin/projects', active: !statusFilter && !featuredOnly },
    {
      label: 'Published',
      href: '/admin/projects?status=PUBLISHED',
      active: statusFilter === 'PUBLISHED',
    },
    { label: 'Drafts', href: '/admin/projects?status=DRAFT', active: statusFilter === 'DRAFT' },
    { label: 'Featured', href: '/admin/projects?featured=1', active: featuredOnly },
  ];

  return (
    <>
      <PageHeading
        title="Projects"
        description="Each project has its own page on the website. Published projects appear in the archive; featured ones also appear on the homepage."
        action={<AdminLinkButton href="/admin/projects/new">New project</AdminLinkButton>}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter projects" className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.href}
              aria-current={filter.active ? 'true' : undefined}
              className={
                filter.active
                  ? 'border border-ink bg-ink px-3 py-1.5 text-xs font-medium text-paper'
                  : 'border border-[#d5d4ce] bg-white px-3 py-1.5 text-xs transition-colors hover:border-ink/50'
              }
            >
              {filter.label}
            </Link>
          ))}
        </nav>

        <form method="get" className="flex items-center gap-2">
          {statusFilter ? <input type="hidden" name="status" value={statusFilter} /> : null}
          <label className="sr-only" htmlFor="project-search">
            Search projects
          </label>
          <input
            id="project-search"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search projects…"
            className="h-9 w-56 max-w-full border border-[#d5d4ce] bg-white px-3 text-sm focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            className="h-9 border border-[#d5d4ce] px-3 text-sm transition-colors hover:border-ink/50"
          >
            Search
          </button>
        </form>
      </div>

      {projects.length === 0 ? (
        <Panel padded={false}>
          <div className="p-4">
            <EmptyState
              icon={<FolderKanban className="size-7" aria-hidden="true" />}
              title={query || statusFilter ? 'No matching projects' : 'No projects yet'}
              description={
                query || statusFilter
                  ? 'Try clearing the filters.'
                  : 'Create your first project, add photographs and publish it to the website.'
              }
              action={<AdminLinkButton href="/admin/projects/new">New project</AdminLinkButton>}
            />
          </div>
        </Panel>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th className="w-16">Cover</Th>
              <Th>Project</Th>
              <Th>Sector</Th>
              <Th className="w-20">Year</Th>
              <Th className="w-24">Images</Th>
              <Th className="w-28">Status</Th>
              <Th className="w-40">Updated</Th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const cover = project.images[0]?.mediaAsset;
              return (
                <tr key={project.id} className="transition-colors hover:bg-[#faf9f7]">
                  <Td>
                    <span className="relative block size-11 overflow-hidden bg-[#f2f1ee]">
                      {cover ? (
                        <Image
                          src={storage().url(cover.storageKey)}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="block font-medium hover:underline"
                    >
                      {project.titleEn || project.titleAr}
                    </Link>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                      <span dir="rtl">{project.titleAr}</span>
                      {project.featured ? (
                        <Badge tone="accent">
                          <Star className="me-1 size-2.5" aria-hidden="true" />
                          Featured
                        </Badge>
                      ) : null}
                    </span>
                  </Td>
                  <Td className="text-ink-muted">{project.sector?.nameEn ?? '—'}</Td>
                  <Td className="tabular-nums text-ink-muted">{project.year ?? '—'}</Td>
                  <Td className="tabular-nums text-ink-muted">{project._count.images}</Td>
                  <Td>
                    <StatusBadge status={project.publishStatus} />
                  </Td>
                  <Td className="text-xs text-ink-muted">
                    {formatDateTime(project.updatedAt, 'en')}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
