import type { Metadata } from 'next';
import { MailCheck } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getAdminT } from '@/lib/admin/locale';
import { EmptyState, PageHeading, TableWrap, Td, Th } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/utils';

export const metadata: Metadata = { title: 'Newsletter' };

/**
 * The newsletter list.
 *
 * Read-only on purpose: addresses arrive from the public form and the only
 * thing the owner needs here is to see and copy them. Nothing is sent from the
 * dashboard, so there is no send button to mistake for one.
 */
export default async function SubscribersPage() {
  const { locale, t } = await getAdminT();

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return (
    <>
      <PageHeading
        title="Newsletter"
        description="Addresses collected by the subscribe form on the website. Copy them into whichever mailing tool you use — nothing is sent from here."
        breadcrumbs={[{ label: 'Configuration' }, { label: 'Newsletter' }]}
      />

      {subscribers.length === 0 ? (
        <EmptyState
          icon={<MailCheck className="size-7" aria-hidden="true" />}
          title="No subscribers yet"
          description="Anyone who subscribes through the website will be listed here."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-muted">
            {subscribers.length} {t(subscribers.length === 1 ? 'subscriber' : 'subscribers')}
          </p>

          <TableWrap>
            <thead>
              <tr>
                <Th>Email</Th>
                <Th className="w-24">Language</Th>
                <Th className="w-48">Subscribed</Th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <Td className="text-sm" >
                    <span dir="ltr">{subscriber.email}</span>
                  </Td>
                  <Td className="text-xs uppercase text-ink-muted">{subscriber.locale ?? '—'}</Td>
                  <Td className="text-xs text-ink-muted">
                    {formatDateTime(subscriber.createdAt, locale)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </>
      )}
    </>
  );
}
