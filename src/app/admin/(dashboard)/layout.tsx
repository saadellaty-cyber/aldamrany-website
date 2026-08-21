import Link from 'next/link';
import type { ReactNode } from 'react';
import { ExternalLink, LogOut } from 'lucide-react';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/guard';
import { getAdminT } from '@/lib/admin/locale';
import { signOut } from '@/app/admin/login/actions';
import { AdminLocaleProvider } from '@/components/admin/AdminLocaleProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/**
 * Authenticated dashboard shell. Every page below this layout is guarded —
 * server actions re-check permissions independently, so this is defence in
 * depth rather than the only gate.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser('/admin');
  const [newMessages, { locale, t }] = await Promise.all([
    prisma.contactSubmission.count({ where: { status: 'NEW' } }),
    getAdminT(),
  ]);

  return (
    <AdminLocaleProvider locale={locale}>
      <div className="flex min-h-dvh">
        <AdminSidebar role={user.role} newMessages={newMessages} locale={locale} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#e2e1dc] bg-white/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-3 lg:hidden">
              <AdminSidebar role={user.role} newMessages={newMessages} locale={locale} />
              <span className="text-sm font-semibold tracking-[0.14em]">EL DAMARANY</span>
            </div>

            <div className="ms-auto flex items-center gap-3">
              <Link
                href={`/${locale}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                {t('View site')}
              </Link>

              <span className="hidden h-4 w-px bg-[#e2e1dc] sm:block" aria-hidden="true" />

              <div className="hidden text-end sm:block">
                <p className="text-xs font-medium leading-tight">{user.name}</p>
                <p className="text-[0.6875rem] leading-tight text-ink-muted">
                  {t(user.role === 'ADMIN' ? 'Administrator' : 'Editor')}
                </p>
              </div>

              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 border border-[#d5d4ce] px-2.5 py-1.5 text-xs transition-colors hover:border-ink/50"
                >
                  <LogOut className="size-3.5" aria-hidden="true" />
                  {t('Sign out')}
                </button>
              </form>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
        </div>
      </div>
    </AdminLocaleProvider>
  );
}
