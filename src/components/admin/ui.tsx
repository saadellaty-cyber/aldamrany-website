'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { useTranslateNode } from '@/components/admin/AdminLocaleProvider';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Presentational building blocks for the dashboard.

   These are client components purely so they can read the dashboard language
   from context and translate the plain-string labels handed to them. Screens
   keep writing readable English literals; the translation happens here, once,
   instead of in every screen.
------------------------------------------------------------------------- */

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        'border border-[#e2e1dc] bg-white',
        padded && 'p-5 md:p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const tr = useTranslateNode();

  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-base font-semibold tracking-tight">{tr(title)}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">{tr(description)}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHeading({
  title,
  description,
  action,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  const tr = useTranslateNode();

  return (
    <header className="mb-7">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label={tr('Breadcrumb') as string} className="mb-3">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-ink">
                    {tr(crumb.label)}
                  </Link>
                ) : (
                  <span>{tr(crumb.label)}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{tr(title)}</h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
              {tr(description)}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

/* --- Buttons ------------------------------------------------------------- */

type AdminButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const BUTTON_VARIANTS: Record<AdminButtonVariant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-raised disabled:bg-ink/40',
  secondary: 'border border-[#d5d4ce] bg-white text-ink hover:border-ink/50 hover:bg-[#faf9f7]',
  danger: 'border border-danger/40 bg-white text-danger hover:bg-danger hover:text-white',
  ghost: 'text-ink-muted hover:bg-black/5 hover:text-ink',
};

const buttonBase =
  'inline-flex h-9.5 select-none items-center justify-center gap-2 px-3.5 text-sm font-medium ' +
  'transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60';

export function AdminButton({
  variant = 'primary',
  className,
  type = 'button',
  children,
  ...rest
}: ComponentProps<'button'> & { variant?: AdminButtonVariant }) {
  const tr = useTranslateNode();

  return (
    <button
      type={type}
      className={cn(buttonBase, BUTTON_VARIANTS[variant], className)}
      {...rest}
    >
      {tr(children)}
    </button>
  );
}

export function AdminLinkButton({
  variant = 'primary',
  className,
  href,
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: AdminButtonVariant }) {
  const tr = useTranslateNode();

  return (
    <Link href={href} className={cn(buttonBase, BUTTON_VARIANTS[variant], className)} {...rest}>
      {tr(children)}
    </Link>
  );
}

/* --- Status --------------------------------------------------------------- */

export function StatusBadge({ status }: { status: 'DRAFT' | 'PUBLISHED' }) {
  const published = status === 'PUBLISHED';
  const tr = useTranslateNode();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide',
        published
          ? 'border-success/30 bg-success/8 text-success'
          : 'border-[#d5d4ce] bg-[#f2f1ee] text-ink-muted',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', published ? 'bg-success' : 'bg-ink-muted')}
      />
      {tr(published ? 'Published' : 'Draft')}
    </span>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'danger' | 'warning';
}) {
  const tr = useTranslateNode();
  const tones = {
    neutral: 'border-[#d5d4ce] bg-[#f2f1ee] text-ink-muted',
    accent: 'border-ink/20 bg-ink/5 text-ink',
    danger: 'border-danger/30 bg-danger/8 text-danger',
    warning: 'border-warning/30 bg-warning/8 text-warning',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center border px-2 py-0.5 text-[0.6875rem] font-medium',
        tones[tone],
      )}
    >
      {tr(children)}
    </span>
  );
}

/* --- States -------------------------------------------------------------- */

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  const tr = useTranslateNode();

  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-[#d5d4ce] bg-white px-6 py-16 text-center">
      {icon ? <div className="mb-4 text-ink-muted">{icon}</div> : null}
      <p className="text-base font-medium">{tr(title)}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{tr(description)}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function FormMessage({
  tone,
  children,
}: {
  tone: 'success' | 'error' | 'info';
  children: ReactNode;
}) {
  const tones = {
    success: 'border-success/30 bg-success/8 text-success',
    error: 'border-danger/30 bg-danger/8 text-danger',
    info: 'border-[#d5d4ce] bg-[#f2f1ee] text-ink-muted',
  } as const;

  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('border px-4 py-3 text-sm', tones[tone])}
    >
      {children}
    </p>
  );
}

/* --- Tables -------------------------------------------------------------- */

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="scrollbar-thin overflow-x-auto border border-[#e2e1dc] bg-white">
      <table className="w-full min-w-[42rem] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  const tr = useTranslateNode();

  return (
    <th
      scope="col"
      className={cn(
        'border-b border-[#e2e1dc] bg-[#faf9f7] px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-ink-muted',
        className,
      )}
    >
      {tr(children)}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn('border-b border-[#eeedea] px-4 py-3 align-middle', className)}>
      {children}
    </td>
  );
}

/* --- Layout helpers ------------------------------------------------------ */

export function FieldGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid gap-5 md:grid-cols-2', className)}>{children}</div>;
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Panel className="space-y-5">
      <PanelHeader title={title} description={description} />
      {children}
    </Panel>
  );
}

export function StickyActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-[#e2e1dc] bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <div className="flex flex-wrap items-center justify-end gap-3">{children}</div>
    </div>
  );
}
