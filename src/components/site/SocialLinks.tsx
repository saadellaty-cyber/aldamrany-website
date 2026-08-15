import type { SocialItem } from '@/lib/content/site';
import type { SocialPlatform } from '@/generated/prisma/enums';
import { cn } from '@/lib/utils';

/**
 * Brand marks are inlined rather than pulled from an icon library, because
 * icon sets routinely drop or rename brand glyphs between major versions.
 */
const PATHS: Record<SocialPlatform, { label: string; path: string }> = {
  FACEBOOK: {
    label: 'Facebook',
    path: 'M14 9h2.5V6H14c-2.2 0-3.5 1.4-3.5 3.6V11H8.5v3h2V22h3v-8h2.4l.6-3h-3V9.8c0-.5.2-.8.5-.8Z',
  },
  INSTAGRAM: {
    label: 'Instagram',
    path: 'M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4ZM16.3 8a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0ZM8.4 3.5h7.2A4.9 4.9 0 0 1 20.5 8.4v7.2a4.9 4.9 0 0 1-4.9 4.9H8.4a4.9 4.9 0 0 1-4.9-4.9V8.4a4.9 4.9 0 0 1 4.9-4.9Zm0 1.6A3.3 3.3 0 0 0 5.1 8.4v7.2a3.3 3.3 0 0 0 3.3 3.3h7.2a3.3 3.3 0 0 0 3.3-3.3V8.4a3.3 3.3 0 0 0-3.3-3.3Z',
  },
  LINKEDIN: {
    label: 'LinkedIn',
    path: 'M6.2 8.9H3.6V21h2.6V8.9ZM4.9 3a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM21 14.1c0-3.2-1.7-4.7-4-4.7-1.8 0-2.7 1-3.1 1.7V8.9H11.2c0 .8 0 12.1 0 12.1h2.7v-6.8c0-.4 0-.7.1-1 .3-.7.9-1.5 2-1.5 1.4 0 2 1.1 2 2.7V21H21v-6.9Z',
  },
  YOUTUBE: {
    label: 'YouTube',
    path: 'M21.6 8.1a2.5 2.5 0 0 0-1.8-1.8C18.2 5.9 12 5.9 12 5.9s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 8.1 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.9 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-3.9ZM10.1 15V9l5.1 3-5.1 3Z',
  },
  TIKTOK: {
    label: 'TikTok',
    path: 'M16.5 3h-2.7v12.1a2.4 2.4 0 1 1-2-2.4v-2.8a5.2 5.2 0 1 0 4.7 5.2V9.3a6.2 6.2 0 0 0 3.5 1.1V7.7a3.5 3.5 0 0 1-3.5-3.5V3Z',
  },
  X: {
    label: 'X',
    path: 'M17.5 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.1 21H2l7.3-8.3L2.3 3h6.4l4.4 5.9L17.5 3Zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3Z',
  },
};

export function SocialLinks({
  links,
  className,
  itemClassName,
  size = 'md',
}: {
  links: SocialItem[];
  className?: string;
  itemClassName?: string;
  size?: 'sm' | 'md';
}) {
  // Nothing is rendered until the owner has actually pasted a URL.
  if (links.length === 0) return null;

  return (
    <ul className={cn('flex items-center gap-2', className)}>
      {links.map((link) => {
        const icon = PATHS[link.platform];
        return (
          <li key={link.platform}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={icon.label}
              className={cn(
                'inline-flex items-center justify-center border border-current/20 transition-colors duration-300 hover:border-current/60',
                size === 'sm' ? 'size-9' : 'size-11',
                itemClassName,
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className={size === 'sm' ? 'size-4' : 'size-[1.125rem]'}
              >
                <path d={icon.path} />
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
