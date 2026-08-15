import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
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
 * public site: a plain LTR working surface rather than the editorial theme.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-[#f6f6f4] font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
