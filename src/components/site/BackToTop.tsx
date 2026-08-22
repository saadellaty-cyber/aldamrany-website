'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Return to the top of a long page.
 *
 * Hidden until the reader is far enough down that scrolling back would be a
 * chore, and it respects reduced motion by jumping rather than gliding.
 */
export function BackToTop() {
  const t = useTranslations();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={t('common.backToTop')}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
        })
      }
      className={cn(
        'fixed bottom-5 end-5 z-40 inline-flex size-11 items-center justify-center rounded-full',
        'bg-gold text-night shadow-lg transition-all duration-300 hover:bg-gold-soft',
        visible ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp className="size-4" aria-hidden="true" />
    </button>
  );
}
