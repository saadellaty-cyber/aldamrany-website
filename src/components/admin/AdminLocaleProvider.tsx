'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { adminT, type AdminLocale, type AdminTranslator } from '@/lib/admin/i18n';

/**
 * Carries the dashboard language down to every component beneath it.
 *
 * The alternative — threading a `locale` prop through forty screens — would be
 * noise in every signature. The provider sits in the dashboard layout, so both
 * server and client components below it are translated by the shared primitives
 * in `ui.tsx` and `fields.tsx` without touching the screens themselves.
 *
 * Arabic is the default: this is an Arabic-speaking company's dashboard, and a
 * component rendered outside the provider (the login screen) should still read
 * in the owner's language.
 */
const AdminLocaleContext = createContext<AdminLocale>('ar');

export function AdminLocaleProvider({
  locale,
  children,
}: {
  locale: AdminLocale;
  children: ReactNode;
}) {
  return <AdminLocaleContext.Provider value={locale}>{children}</AdminLocaleContext.Provider>;
}

export function useAdminLocale(): AdminLocale {
  return useContext(AdminLocaleContext);
}

export function useAdminT(): AdminTranslator {
  const locale = useAdminLocale();
  return useMemo(() => adminT(locale), [locale]);
}

/**
 * Translates a node only when it is a plain string. Props typed as `ReactNode`
 * routinely carry counts, elements or fragments — those pass through untouched.
 */
export function useTranslateNode(): (node: ReactNode) => ReactNode {
  const t = useAdminT();
  return (node: ReactNode) => (typeof node === 'string' ? t(node) : node);
}
