'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

/**
 * Route-level error boundary for the public site. Never surfaces the raw error
 * to visitors; the digest is logged for correlation with server logs.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    console.error('Public route error:', error.digest ?? error.message);
  }, [error]);

  return (
    <section className="surface-dark flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="display-3 max-w-xl text-balance">{t('error.title')}</h1>
      <p className="lead mt-5 max-w-md text-paper/60">{t('error.description')}</p>

      <div className="mt-10">
        <Button variant="inverse" size="lg" onClick={reset}>
          {t('error.retry')}
        </Button>
      </div>
    </section>
  );
}
