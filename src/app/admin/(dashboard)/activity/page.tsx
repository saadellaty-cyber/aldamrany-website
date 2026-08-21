import type { Metadata } from 'next';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { prisma } from '@/lib/db';
import {
  AdminLinkButton,
  Badge,
  EmptyState,
  PageHeading,
  TableWrap,
  Td,
  Th,
} from '@/components/admin/ui';
import { getAdminT } from '@/lib/admin/locale';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Activity Log' };

const PAGE_SIZE = 50;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, t } = await getAdminT();
  const params = await searchParams;
  const page = Math.max(1, Number(typeof params.page === 'string' ? params.page : '1') || 1);

  const [entries, total] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.activityLog.count(),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeading
        title="Activity Log"
        description="A record of what has been changed in the dashboard, and by whom."
        breadcrumbs={[{ label: 'System' }, { label: 'Activity Log' }]}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={<Activity className="size-7" aria-hidden="true" />}
          title="Nothing recorded yet"
          description="Actions taken in the dashboard will be listed here."
        />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th className="w-44">When</Th>
                <Th className="w-40">Who</Th>
                <Th className="w-28">Action</Th>
                <Th>Details</Th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <Td className="whitespace-nowrap text-xs text-ink-muted">
                    {formatDateTime(entry.createdAt, locale)}
                  </Td>
                  <Td className="text-xs">
                    {entry.user?.name ?? <span className="text-ink-muted">{t('System')}</span>}
                  </Td>
                  <Td>
                    <Badge tone={entry.action === 'DELETE' ? 'danger' : 'neutral'}>
                      {entry.action}
                    </Badge>
                  </Td>
                  <Td className="text-sm">{entry.summary}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          {pageCount > 1 ? (
            <nav
              aria-label={t('Activity pages')}
              className="mt-4 flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-ink-muted">
                {t('Page')} {page} {t('of')} {pageCount} · {total} {t('entries')}
              </span>
              <span className="flex gap-2">
                {page > 1 ? (
                  <AdminLinkButton variant="secondary" href={`/admin/activity?page=${page - 1}`}>
                    Previous
                  </AdminLinkButton>
                ) : null}
                {page < pageCount ? (
                  <AdminLinkButton variant="secondary" href={`/admin/activity?page=${page + 1}`}>
                    Next
                  </AdminLinkButton>
                ) : null}
              </span>
            </nav>
          ) : null}
        </>
      )}

      <p className="mt-6 text-xs text-ink-muted">
        {t('Looking for a specific change?')}{' '}
        <Link href="/admin/projects" className="underline">
          {t('Open the project list')}
        </Link>{' '}
        {t('to see when each project was last updated.')}
      </p>
    </>
  );
}
