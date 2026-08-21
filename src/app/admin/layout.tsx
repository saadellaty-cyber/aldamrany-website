import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { getAdminLocale } from '@/lib/admin/locale';
import { adminDirection } from '@/lib/admin/i18n';
import { arabicFontClass } from '@/lib/fonts';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-latin', display: 'swap' });

// The dashboard always reflects the current database state.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'EL DAMARANY — Dashboard',
    template: '%s · EL DAMARANY Dashboard',
  },
  // The admin must never be indexed, regardless of robots.txt.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Root layout for /admin. Deliberately a separate document shell from the
 * public site: a plain working surface rather than the editorial theme.
 *
 * Its language — and therefore its writing direction — follows the setting
 * chosen in Site Settings, so an Arabic-speaking owner works right-to-left.
 */
export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const locale = await getAdminLocale();
  const dir = adminDirection(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${arabicFontClass('cairo')}`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-dvh bg-[#f6f6f4] text-ink antialiased ${
          locale === 'ar' ? 'font-arabic' : 'font-sans'
        }`}
      >
        {children}
      </body>
    </html>
  );
}
