import Link from 'next/link';
import type { Metadata } from 'next';
import { FileEdit, FolderKanban, Images, Inbox, Star, Upload } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/guard';
import {
  AdminLinkButton,
  EmptyState,
  Panel,
  PanelHeader,
  PageHeading,
  StatusBadge,
} from '@/components/admin/ui';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardHome() {
  const user = await getCurrentUser();

  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    featuredProjects,
    mediaCount,
    newMessages,
    totalMessages,
    recentProjects,
    recentActivity,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { publishStatus: 'PUBLISHED' } }),
    prisma.project.count({ where: { publishStatus: 'DRAFT' } }),
    prisma.project.count({ where: { featured: true, publishStatus: 'PUBLISHED' } }),
    prisma.mediaAsset.count(),
    prisma.contactSubmission.count({ where: { status: 'NEW' } }),
    prisma.contactSubmission.count(),
    prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 6,
      select: { id: true, titleEn: true, titleAr: true, publishStatus: true, updatedAt: true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const tiles = [
    { label: 'Projects', value: totalProjects, href: '/admin/projects', icon: FolderKanban },
    { label: 'Published', value: publishedProjects, href: '/admin/projects?status=PUBLISHED', icon: FolderKanban },
    { label: 'Drafts', value: draftProjects, href: '/admin/projects?status=DRAFT', icon: FileEdit },
    { label: 'Featured', value: featuredProjects, href: '/admin/projects?featured=1', icon: Star },
    { label: 'Media assets', value: mediaCount, href: '/admin/media', icon: Images },
    { label: 'New messages', value: newMessages, href: '/admin/messages', icon: Inbox },
  ];

  return (
    <>
      <PageHeading
        title={`Welcome${user ? `, ${user.name.split(' ')[0]}` : ''}`}
        description="Everything on the public website is managed from here. Changes appear on the site as soon as they are saved and published."
      />

      {/* Counters */}
      <div className="grid grid-cols-2 gap-px border border-[#e2e1dc] bg-[#e2e1dc] lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group bg-white p-4 transition-colors hover:bg-[#faf9f7]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-muted">{tile.label}</span>
              <tile.icon className="size-3.5 text-ink-muted" aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{tile.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <Panel className="mt-6">
        <PanelHeader
          title="Quick actions"
          description="The tasks you are most likely to need."
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <AdminLinkButton href="/admin/projects/new">
            <FolderKanban className="size-4" aria-hidden="true" />
            New project
          </AdminLinkButton>
          <AdminLinkButton href="/admin/media" variant="secondary">
            <Upload className="size-4" aria-hidden="true" />
            Upload media
          </AdminLinkButton>
          <AdminLinkButton href="/admin/homepage" variant="secondary">
            Edit homepage
          </AdminLinkButton>
          <AdminLinkButton href="/admin/messages" variant="secondary">
            <Inbox className="size-4" aria-hidden="true" />
            View messages ({totalMessages})
          </AdminLinkButton>
          <AdminLinkButton href="/admin/settings" variant="secondary">
            Site settings
          </AdminLinkButton>
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recently updated projects */}
        <Panel>
          <PanelHeader
            title="Recently updated projects"
            action={
              <Link href="/admin/projects" className="text-xs text-ink-muted hover:text-ink">
                View all
              </Link>
            }
          />
          {recentProjects.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No projects yet"
                description="Create your first project to see it on the website."
                action={<AdminLinkButton href="/admin/projects/new">New project</AdminLinkButton>}
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#eeedea]">
              {recentProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-ink-muted"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {project.titleEn || project.titleAr}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-muted">
                        Updated {formatDateTime(project.updatedAt, 'en')}
                      </span>
                    </span>
                    <StatusBadge status={project.publishStatus} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Activity */}
        <Panel>
          <PanelHeader
            title="Recent activity"
            action={
              <Link href="/admin/activity" className="text-xs text-ink-muted hover:text-ink">
                View all
              </Link>
            }
          />
          {recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No activity recorded yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#eeedea]">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="py-3">
                  <p className="text-sm">{entry.summary}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {entry.user?.name ?? 'System'} · {formatDateTime(entry.createdAt, 'en')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
