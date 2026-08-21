import type { Metadata } from 'next';
import Link from 'next/link';
import { Inbox, Mail, Phone } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/guard';
import {
  deleteMessage,
  saveMessageNotes,
  setMessageStatus,
} from '@/app/admin/(dashboard)/messages/actions';
import {
  AdminButton,
  Badge,
  EmptyState,
  PageHeading,
  Panel,
} from '@/components/admin/ui';
import { getAdminT } from '@/lib/admin/locale';
import { formatDateTime, mailtoLink, telLink } from '@/lib/utils';
import type { ContactStatus } from '@/generated/prisma/enums';
import type { Prisma } from '@/generated/prisma/client';

export const metadata: Metadata = { title: 'Contact Messages' };

const STATUS_TONE: Record<ContactStatus, 'accent' | 'warning' | 'neutral'> = {
  NEW: 'accent',
  CONTACTED: 'warning',
  CLOSED: 'neutral',
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, t } = await getAdminT();
  const params = await searchParams;
  const filter = typeof params.status === 'string' ? params.status : '';

  const where: Prisma.ContactSubmissionWhereInput =
    filter === 'NEW' || filter === 'CONTACTED' || filter === 'CLOSED'
      ? { status: filter satisfies ContactStatus }
      : {};

  const [messages, counts, user] = await Promise.all([
    prisma.contactSubmission.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.contactSubmission.groupBy({ by: ['status'], _count: { _all: true } }),
    getCurrentUser(),
  ]);

  const countFor = (status: ContactStatus) =>
    counts.find((entry) => entry.status === status)?._count._all ?? 0;

  const filters = [
    { label: t('All'), href: '/admin/messages', active: !filter },
    {
      label: `${t('NEW')} (${countFor('NEW')})`,
      href: '/admin/messages?status=NEW',
      active: filter === 'NEW',
    },
    {
      label: `${t('CONTACTED')} (${countFor('CONTACTED')})`,
      href: '/admin/messages?status=CONTACTED',
      active: filter === 'CONTACTED',
    },
    {
      label: `${t('CLOSED')} (${countFor('CLOSED')})`,
      href: '/admin/messages?status=CLOSED',
      active: filter === 'CLOSED',
    },
  ];

  return (
    <>
      <PageHeading
        title="Contact Messages"
        description="Enquiries submitted through the contact form on the website."
        breadcrumbs={[{ label: 'Configuration' }, { label: 'Contact Messages' }]}
      />

      <nav aria-label={t('Filter messages')} className="mb-4 flex flex-wrap gap-2">
        {filters.map((entry) => (
          <Link
            key={entry.label}
            href={entry.href}
            aria-current={entry.active ? 'true' : undefined}
            className={
              entry.active
                ? 'border border-ink bg-ink px-3 py-1.5 text-xs font-medium text-paper'
                : 'border border-[#d5d4ce] bg-white px-3 py-1.5 text-xs transition-colors hover:border-ink/50'
            }
          >
            {entry.label}
          </Link>
        ))}
      </nav>

      {messages.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-7" aria-hidden="true" />}
          title="No messages"
          description="Enquiries from the website's contact form will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => {
            const emailHref = mailtoLink(message.email);
            const phoneHref = telLink(message.phone);

            return (
              <li key={message.id}>
                <Panel className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        {message.name}
                        <Badge tone={STATUS_TONE[message.status]}>{t(message.status)}</Badge>
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {formatDateTime(message.createdAt, locale)}
                        {message.company ? ` · ${message.company}` : ''}
                        {message.projectType ? ` · ${message.projectType}` : ''}
                        {message.locale ? ` · ${message.locale.toUpperCase()}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {emailHref ? (
                        <a
                          href={emailHref}
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-ink-muted"
                        >
                          <Mail className="size-3.5" aria-hidden="true" />
                          {message.email}
                        </a>
                      ) : null}
                      {phoneHref && message.phone ? (
                        <a
                          href={phoneHref}
                          dir="ltr"
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-ink-muted"
                        >
                          <Phone className="size-3.5" aria-hidden="true" />
                          {message.phone}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap border-s-2 border-[#e2e1dc] ps-4 text-sm leading-relaxed">
                    {message.message}
                  </p>

                  <form action={saveMessageNotes} className="flex flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={message.id} />
                    <label className="min-w-0 flex-1">
                      <span className="mb-1.5 block text-xs font-medium">{t('Internal note')}</span>
                      <input
                        name="notes"
                        defaultValue={message.notes ?? ''}
                        placeholder={t('Optional — not visible to the sender')}
                        className="h-9 w-full border border-[#d5d4ce] bg-white px-3 text-sm focus:border-ink focus:outline-none"
                      />
                    </label>
                    <AdminButton type="submit" variant="secondary">
                      Save note
                    </AdminButton>
                  </form>

                  <div className="flex flex-wrap gap-2 border-t border-[#eeedea] pt-3">
                    {message.status !== 'CONTACTED' ? (
                      <form action={setMessageStatus}>
                        <input type="hidden" name="id" value={message.id} />
                        <input type="hidden" name="status" value="CONTACTED" />
                        <AdminButton type="submit" variant="secondary">
                          Mark contacted
                        </AdminButton>
                      </form>
                    ) : null}

                    {message.status !== 'CLOSED' ? (
                      <form action={setMessageStatus}>
                        <input type="hidden" name="id" value={message.id} />
                        <input type="hidden" name="status" value="CLOSED" />
                        <AdminButton type="submit" variant="secondary">
                          Mark closed
                        </AdminButton>
                      </form>
                    ) : null}

                    {message.status !== 'NEW' ? (
                      <form action={setMessageStatus}>
                        <input type="hidden" name="id" value={message.id} />
                        <input type="hidden" name="status" value="NEW" />
                        <AdminButton type="submit" variant="ghost">
                          Reopen
                        </AdminButton>
                      </form>
                    ) : null}

                    {user?.role === 'ADMIN' ? (
                      <form action={deleteMessage} className="ms-auto">
                        <input type="hidden" name="id" value={message.id} />
                        <AdminButton type="submit" variant="danger">
                          Delete
                        </AdminButton>
                      </form>
                    ) : null}
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
