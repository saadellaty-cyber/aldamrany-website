'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type Theme = 'night' | 'day';

/** Shared with the inline script in the document head — keep them in step. */
export const THEME_STORAGE_KEY = 'eldamarany-theme';

const THEME_EVENT = 'eldamarany:themechange';

/**
 * The document element is the source of truth, not React state.
 *
 * The inline script in the head sets it before first paint, so reading from it
 * means the button can never disagree with what is actually on screen — and
 * there is no effect writing state on mount to cause a second render.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === 'day' ? 'day' : 'night';
}

/** The server cannot know the reader's choice; it renders the drawn default. */
function getServerSnapshot(): Theme {
  return 'night';
}

/**
 * Switches the site between the dark house and day mode. The choice is written
 * to the document element and to local storage, where the head script picks it
 * up on the next visit.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations();
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDay = theme === 'day';

  const toggle = () => {
    const next: Theme = isDay ? 'night' : 'day';
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing can refuse storage; the choice still applies to this
      // page view, it just will not be remembered.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const label = isDay ? t('theme.toNight') : t('theme.toDay');

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-full border border-current/25',
        'text-current transition-colors duration-200 hover:border-current/60',
        className,
      )}
    >
      {isDay ? (
        <Moon className="size-4" aria-hidden="true" />
      ) : (
        <Sun className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
