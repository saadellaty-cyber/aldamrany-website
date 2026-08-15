'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import type { NavItem } from '@/lib/content/site';
import { LanguageSwitcher } from '@/components/site/LanguageSwitcher';
import { cn } from '@/lib/utils';

type SiteHeaderProps = {
  locale: Locale;
  nav: NavItem[];
  logo: string | null;
  companyName: string | null;
  contactHref: string;
};

/**
 * Sticky header that sits transparently over the hero and condenses into a
 * blurred dark bar once the page scrolls. It also hides while scrolling down
 * and returns on the way up, keeping long project pages uncluttered.
 */
export function SiteHeader({ locale, nav, logo, companyName, contactHref }: SiteHeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // The menu records the route it was opened on, so any navigation closes it
  // without an effect that would cause an extra render pass.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const menuOpen = openedOn === pathname;
  const setMenuOpen = (next: boolean) => setOpenedOn(next ? pathname : null);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        setHidden(y > 320 && y > lastY);
        lastY = y;
        frame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Prevent the page behind a full-screen menu from scrolling.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // Clear the state setter directly; `setMenuOpen` is rebuilt every render.
      if (event.key === 'Escape') setOpenedOn(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const isCurrent = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 text-paper transition-[transform,background-color,backdrop-filter,border-color] duration-500',
          'border-b',
          scrolled
            ? 'border-white/10 bg-ink/85 backdrop-blur-xl'
            : 'border-transparent bg-transparent',
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0',
        )}
        style={{ ['--header-height' as string]: '4.5rem' }}
      >
        <div className="container-page flex h-18 items-center justify-between gap-6 md:h-20">
          <Link
            href={`/${locale}`}
            className="flex shrink-0 items-center gap-3"
            aria-label={companyName ?? 'EL DAMARANY'}
          >
            {logo ? (
              <Image
                src={logo}
                alt={companyName ?? 'EL DAMARANY'}
                width={160}
                height={40}
                priority
                className="h-8 w-auto object-contain md:h-9"
              />
            ) : (
              <span className="flex flex-col leading-none">
                <span className="text-base font-semibold tracking-[0.16em] md:text-lg">
                  EL DAMARANY
                </span>
                <span className="mt-1 text-[0.5625rem] tracking-[0.3em] opacity-60">
                  SINCE 1978
                </span>
              </span>
            )}
          </Link>

          <nav
            aria-label={t('nav.primaryNavigation')}
            className="hidden items-center gap-7 xl:flex"
          >
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                aria-current={isCurrent(item.href) ? 'page' : undefined}
                className={cn(
                  'relative py-2 text-sm transition-opacity duration-200 hover:opacity-100',
                  isCurrent(item.href) ? 'opacity-100' : 'opacity-70',
                )}
              >
                {item.label}
                {isCurrent(item.href) ? (
                  <span className="absolute inset-x-0 -bottom-0.5 h-px bg-current" aria-hidden="true" />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            <LanguageSwitcher locale={locale} tone="dark" className="text-paper" />

            <Link
              href={contactHref}
              className="hidden h-10 items-center border border-paper/35 px-5 text-sm font-medium transition-colors duration-300 hover:bg-paper hover:text-ink lg:inline-flex"
            >
              {t('common.discussProject')}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('nav.openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="-me-2 inline-flex size-10 items-center justify-center xl:hidden"
            >
              <Menu className="size-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            className="fixed inset-0 z-60 flex flex-col bg-ink text-paper xl:hidden"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.83, 0, 0.17, 1] }}
          >
            <div className="container-page flex h-18 shrink-0 items-center justify-between md:h-20">
              <span className="text-base font-semibold tracking-[0.16em]">EL DAMARANY</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t('nav.closeMenu')}
                autoFocus
                className="-me-2 inline-flex size-10 items-center justify-center"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>

            <nav
              aria-label={t('nav.primaryNavigation')}
              className="container-page scrollbar-thin flex-1 overflow-y-auto py-8"
            >
              <ul className="flex flex-col">
                {nav.map((item, index) => (
                  <motion.li
                    key={item.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-white/10"
                  >
                    <Link
                      href={item.href}
                      target={item.isExternal ? '_blank' : undefined}
                      rel={item.isExternal ? 'noopener noreferrer' : undefined}
                      className="flex items-baseline justify-between py-5 text-2xl font-medium tracking-tight"
                    >
                      {item.label}
                      <span className="latin-nums text-xs opacity-40">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-10">
                <Link
                  href={contactHref}
                  className="inline-flex h-12 items-center justify-center bg-paper px-7 text-sm font-medium text-ink"
                >
                  {t('common.discussProject')}
                </Link>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
